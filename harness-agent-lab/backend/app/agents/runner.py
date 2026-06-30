import json
import re
from pathlib import Path

from app.agents.patterns import PATTERNS
from app.agents.schemas import AgentPattern, AgentRunRequest, AgentRunResponse, TraceStep
from app.agents.tools import (
    compact_trace,
    get_price,
    load_skill,
    load_skill_tags,
    read_memories,
    run_safe_python,
    search_local_web,
    write_memory,
)
from app.core.llm import LLMClient


class AgentPatternRunner:
    def __init__(self) -> None:
        self.llm = LLMClient()

    async def run(self, request: AgentRunRequest) -> AgentRunResponse:
        handler = {
            AgentPattern.intent: self.intent,
            AgentPattern.react: self.react,
            AgentPattern.plan_act: self.plan_act,
            AgentPattern.reflection: self.reflection,
            AgentPattern.codeact: self.codeact,
            AgentPattern.hitl: self.hitl,
            AgentPattern.deep_research: self.deep_research,
            AgentPattern.memory: self.memory,
            AgentPattern.skills: self.skills,
            AgentPattern.manager_subagent: self.manager_subagent,
            AgentPattern.compact_task: self.compact_task,
        }[request.pattern]

        return await handler(request)

    def mode(self, request: AgentRunRequest) -> str:
        return "llm" if request.use_llm and self.llm.available() else "mock"

    async def maybe_llm(self, request: AgentRunRequest, system: str, fallback: str) -> str:
        if self.mode(request) == "mock":
            return fallback
        text = await self.llm.complete(system, request.input)
        return text or fallback

    async def answer_with_context(self, request: AgentRunRequest, system: str, context: str, fallback: str) -> str:
        if self.mode(request) == "mock":
            return fallback
        user = f"用户输入：{request.input}\n\n模式运行上下文：\n{context}\n\n请给用户一个自然、可执行的中文回复。"
        text = await self.llm.complete(system, user)
        return text or fallback

    async def intent(self, request: AgentRunRequest) -> AgentRunResponse:
        intents = []
        text = request.input
        if any(word in text for word in ["买", "预算", "多少钱", "推荐"]):
            intents.append("购买决策")
        if any(word in text for word in ["对比", "哪个", "vs"]):
            intents.append("方案对比")
        if any(word in text for word in ["怎么做", "实现", "代码", "框架"]):
            intents.append("工程实现")
        if not intents:
            intents.append("信息问答")

        trace = [
            TraceStep(phase="sense", title="读取用户输入", detail=request.input),
            TraceStep(phase="infer", title="识别候选意图", detail=" / ".join(intents)),
            TraceStep(
                phase="context",
                title="注入场景上下文",
                detail="加入用户目标、约束、历史偏好，而不是只把原始提示词交给 LLM。",
                payload={"profile": {"role": "Agent 开发者", "preference": "理论到实战"}},
            ),
        ]
        answer = await self.maybe_llm(
            request,
            "你是意图识别专家，请输出用户深层意图和需要补充的上下文。",
            f"识别到主要意图：{intents[0]}。建议补充：目标、约束、成功标准、可用工具。",
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def react(self, request: AgentRunRequest) -> AgentRunResponse:
        trace = [
            TraceStep(phase="thought", title="Thought", detail="需要查询局部知识库，再基于观察生成回答。"),
            TraceStep(phase="action", title="Action: search_local_web", detail=f"query={request.input}"),
        ]
        results = search_local_web(request.input)
        trace.append(TraceStep(phase="observe", title="Observation", detail="获得搜索片段", payload={"results": results}))
        answer = await self.answer_with_context(
            request,
            "你是 ReAct Agent。你必须基于 Thought/Action/Observation 的观察结果回复用户。",
            json.dumps(results, ensure_ascii=False),
            f"ReAct 完成：基于 {len(results)} 条观察结果，建议先把任务拆成意图、工具、记忆、执行四层。",
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def plan_act(self, request: AgentRunRequest) -> AgentRunResponse:
        steps = ["澄清任务目标", "选择 Agent 模式", "调用工具获得证据", "汇总结果并给出下一步"]
        trace = [TraceStep(phase="plan", title="Plan(BaseModel)", detail="生成结构化计划", payload={"steps": steps})]
        remaining = steps.copy()
        while remaining:
            step = remaining.pop(0)
            trace.append(
                TraceStep(
                    phase="execute",
                    title=f"execute_node: {step}",
                    detail=f"执行后将计划缩短，remaining={len(remaining)}",
                    payload={"remaining": remaining.copy()},
                )
            )
        answer = await self.answer_with_context(
            request,
            "你是 Plan-Act Agent。先解释计划，再说明执行结果和下一步。",
            json.dumps(steps, ensure_ascii=False),
            "Plan-Act 完成：计划已逐步执行并动态缩短到空列表。",
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def reflection(self, request: AgentRunRequest) -> AgentRunResponse:
        draft = f"初稿：{request.input} 可以通过 Agent Loop 实现。"
        critique = "反思：初稿缺少失败模式、测试标准和人工介入边界。"
        revised = "修正版：实现时应包含工具调用 trace、错误恢复、HITL 中断和验收测试。"
        trace = [
            TraceStep(phase="generate", title="生成初稿", detail=draft),
            TraceStep(phase="reflect", title="评估器反思", detail=critique),
            TraceStep(phase="revise", title="修正输出", detail=revised),
        ]
        answer = await self.answer_with_context(
            request,
            "你是 Reflection Agent。请先指出初稿问题，再给出修正版答案。",
            "\n".join([draft, critique, revised]),
            revised,
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def codeact(self, request: AgentRunRequest) -> AgentRunResponse:
        numbers = [int(value) for value in re.findall(r"\d+", request.input)]
        code = "result = sum(range(1, 101))" if not numbers else f"result = sum({numbers})"
        output = run_safe_python(code)
        trace = [
            TraceStep(phase="generate_code", title="生成临时代码", detail=code),
            TraceStep(phase="execute", title="沙盒执行", detail="运行受限 Python AST", payload=output),
        ]
        fallback = f"CodeAct 结果：{output['variables'].get('result')}。代码没有进入工具定义，而是作为一次性动作执行。"
        answer = await self.answer_with_context(
            request,
            "你是 CodeAct Agent。请解释代码动作的结果，但不要编造未执行的代码。",
            json.dumps({"code": code, "output": output}, ensure_ascii=False, default=str),
            fallback,
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace, artifacts={"code": code})

    async def hitl(self, request: AgentRunRequest) -> AgentRunResponse:
        if not request.human_reply and not re.search(r"\d+", request.input):
            trace = [
                TraceStep(phase="sense", title="发现缺失参数", detail="数量缺失，无法调用 get_price。"),
                TraceStep(phase="interrupt", title="ask_user", detail="你想买几个？", payload={"field": "quantity"}),
            ]
            return AgentRunResponse(
                pattern=request.pattern,
                mode=self.mode(request),
                status="waiting_human",
                answer="需要补充数量：你想买几个？",
                trace=trace,
            )

        quantity_match = re.search(r"\d+", request.human_reply or request.input)
        quantity = int(quantity_match.group()) if quantity_match else 1
        result = get_price("苹果", quantity)
        trace = [
            TraceStep(phase="resume", title="恢复执行", detail=f"收到 human_reply={request.human_reply or request.input}"),
            TraceStep(phase="tool", title="get_price", detail="调用业务工具", payload=result),
        ]
        fallback = f"{quantity} 个苹果共 {result['total']} 元。"
        answer = await self.answer_with_context(
            request,
            "你是 Human-in-the-Loop Agent。请说明人类补充信息如何让任务恢复执行。",
            json.dumps(result, ensure_ascii=False),
            fallback,
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def deep_research(self, request: AgentRunRequest) -> AgentRunResponse:
        plan = ["定义研究问题", "检索资料", "评估证据", "补充检索", "反思并生成报告"]
        trace = [TraceStep(phase="plan", title="研究计划", detail=" → ".join(plan))]
        all_results = []
        for query in [request.input, f"{request.input} Agent 工程", f"{request.input} 风险"]:
            results = search_local_web(query)
            all_results.extend(results)
            trace.append(TraceStep(phase="search", title="widesearch_for_toolstr", detail=query, payload={"results": results}))
            trace.append(TraceStep(phase="reflect", title="证据评估", detail="若片段不足，继续换 query 搜索。"))
        answer = await self.answer_with_context(
            request,
            "你是 DeepResearch Agent。请基于检索片段输出结构化研究结论、证据和风险。",
            json.dumps(all_results[:8], ensure_ascii=False),
            "DeepResearch 报告：核心是将计划、搜索、反思串成循环，而不是一次性 RAG。",
        )
        return AgentRunResponse(
            pattern=request.pattern,
            mode=self.mode(request),
            status="completed",
            answer=answer,
            trace=trace,
            artifacts={"sources": all_results[:5]},
        )

    async def memory(self, request: AgentRunRequest) -> AgentRunResponse:
        memories = read_memories(request.session_id)
        new_fact = f"用户在 session={request.session_id} 关注：{request.input[:80]}"
        updated = write_memory(request.session_id, new_fact)
        trace = [
            TraceStep(phase="recall", title="长期记忆召回", detail=f"召回 {len(memories)} 条旧记忆", payload={"memories": memories}),
            TraceStep(phase="write", title="写入新记忆", detail=new_fact),
        ]
        fallback = f"已召回 {len(memories)} 条记忆，并写入 1 条新记忆。"
        answer = await self.answer_with_context(
            request,
            "你是 Memory Agent。请结合召回记忆回应用户，并说明新记忆如何影响后续会话。",
            json.dumps({"old": memories, "new": new_fact}, ensure_ascii=False),
            fallback,
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace, artifacts={"memory_count": len(updated)})

    async def skills(self, request: AgentRunRequest) -> AgentRunResponse:
        tags = load_skill_tags()
        selected = "research" if any(word in request.input.lower() for word in ["research", "调研", "搜索"]) else "expense"
        skill_doc = load_skill(selected)
        trace = [
            TraceStep(phase="l1", title="启动时加载 L1 标签", detail="只加载技能名称和摘要", payload={"tags": tags}),
            TraceStep(phase="route", title="LLM 判断匹配 Skill", detail=f"selected={selected}"),
            TraceStep(phase="l2", title="按需读取 SKILL.md", detail=skill_doc[:500]),
            TraceStep(phase="l3", title="资源按需执行", detail="scripts / references 不进入上下文，只有结果返回。"),
        ]
        fallback = f"已按需加载 `{selected}` Skill，演示 Skills 上下文卸载。"
        answer = await self.answer_with_context(
            request,
            "你是 Skills Agent。请使用已加载的 SKILL.md 工作流回答用户，体现按需加载。",
            skill_doc,
            fallback,
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def manager_subagent(self, request: AgentRunRequest) -> AgentRunResponse:
        routes = [
            {"agent": "IntentAgent", "task": "识别任务类型"},
            {"agent": "ResearchAgent", "task": "收集证据"},
            {"agent": "WriterAgent", "task": "汇总输出"},
        ]
        trace = [TraceStep(phase="manager", title="Manager 路由", detail="将任务拆给独立上下文的 SubAgent", payload={"routes": routes})]
        for route in routes:
            trace.append(TraceStep(phase="subagent", title=route["agent"], detail=f"执行：{route['task']}；完成后上下文销毁。"))
        answer = await self.answer_with_context(
            request,
            "你是 Manager Agent。请像任务编排器一样总结子 Agent 分工和最终结果。",
            json.dumps(routes, ensure_ascii=False),
            "Manager + SubAgent 完成：主 Agent 只保留路由结果，子任务细节不污染主上下文。",
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace)

    async def compact_task(self, request: AgentRunRequest) -> AgentRunResponse:
        fake_trace = [
            {"phase": "plan", "title": "创建计划", "detail": "决定先搜索再反思"},
            {"phase": "observe", "title": "搜索完成", "detail": "得到 3 条证据"},
            {"phase": "reflect", "title": "反思完成", "detail": "决定补充风险说明"},
            {"phase": "final", "title": "报告完成", "detail": "输出 Markdown"},
        ]
        compacted = compact_trace(fake_trace)
        task_path = Path(__file__).resolve().parents[1] / "data" / "tasks" / f"{request.session_id}.json"
        task_state = {"session_id": request.session_id, "input": request.input, "compact": compacted}
        task_path.write_text(json.dumps(task_state, ensure_ascii=False, indent=2), encoding="utf-8")
        trace = [
            TraceStep(phase="compact", title="上下文压缩", detail=compacted["summary"], payload=compacted),
            TraceStep(phase="task", title="TaskManager 持久化", detail=str(task_path)),
        ]
        answer = await self.answer_with_context(
            request,
            "你是长任务管理 Agent。请说明 compact 后保留了哪些可恢复状态。",
            json.dumps(task_state, ensure_ascii=False),
            "已将长链路 trace 压缩并写入任务状态。",
        )
        return AgentRunResponse(pattern=request.pattern, mode=self.mode(request), status="completed", answer=answer, trace=trace, artifacts=task_state)


def pattern_catalog() -> list:
    return PATTERNS
