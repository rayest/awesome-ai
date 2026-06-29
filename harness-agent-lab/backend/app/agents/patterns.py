from app.agents.schemas import AgentPattern, PatternInfo


PATTERNS = [
    PatternInfo(
        id=AgentPattern.intent,
        title="Intent Recognition",
        chapter="第2章：上下文的元驱动",
        summary="识别用户表层请求背后的业务意图，并注入用户画像和场景上下文。",
        concepts=["感知", "意图识别", "上下文注入"],
    ),
    PatternInfo(
        id=AgentPattern.react,
        title="Function Calling / ReAct",
        chapter="第1/3/6章：Agent Loop",
        summary="通过 Thought → Action → Observation 循环执行工具调用。",
        concepts=["工具调用", "ReAct", "观察结果"],
    ),
    PatternInfo(
        id=AgentPattern.plan_act,
        title="Plan-Act",
        chapter="第2章：计划模式",
        summary="先产出结构化计划，再按步骤执行并动态缩短计划。",
        concepts=["Plan(BaseModel)", "execute_node", "should_continue"],
    ),
    PatternInfo(
        id=AgentPattern.reflection,
        title="Reflection",
        chapter="第2/3章：反思模式",
        summary="生成初稿后使用评估器反思，再修正输出。",
        concepts=["生成", "评估", "迭代修正"],
    ),
    PatternInfo(
        id=AgentPattern.codeact,
        title="CodeAct",
        chapter="第2章：代码即工具",
        summary="让 Agent 生成受限代码，把编程语言当作临时工具空间。",
        concepts=["代码执行", "动态工具", "沙盒"],
    ),
    PatternInfo(
        id=AgentPattern.hitl,
        title="Human-in-the-Loop",
        chapter="第2章：人机协作",
        summary="信息缺失或高风险操作时中断，等待人类补充或确认。",
        concepts=["interrupt", "ask_user", "checkpointer"],
    ),
    PatternInfo(
        id=AgentPattern.deep_research,
        title="DeepResearch",
        chapter="第3章：DeepResearch",
        summary="计划、搜索、评估、再搜索、反思，生成研究报告。",
        concepts=["Search", "Reflection", "Report"],
    ),
    PatternInfo(
        id=AgentPattern.memory,
        title="Memory",
        chapter="第4章：记忆工程",
        summary="短期上下文摘要 + 长期记忆召回，让 Agent 跨会话记住用户。",
        concepts=["短期记忆", "长期记忆", "召回"],
    ),
    PatternInfo(
        id=AgentPattern.skills,
        title="Skills Progressive Loading",
        chapter="第5章：Skills 上下文卸载",
        summary="启动时只读 L1 标签，命中任务后再加载 L2 文档和 L3 资源。",
        concepts=["L1 标签", "L2 文档", "L3 资源"],
    ),
    PatternInfo(
        id=AgentPattern.manager_subagent,
        title="Manager + SubAgent",
        chapter="第1/6章：多 Agent 分而治之",
        summary="Manager 负责路由，SubAgent 拥有独立上下文执行子任务。",
        concepts=["任务路由", "子上下文", "结果汇总"],
    ),
    PatternInfo(
        id=AgentPattern.compact_task,
        title="Compact + TaskManager",
        chapter="第4/6/7章：长任务管理",
        summary="将长 trace 压缩成完成项、决策和待办，并落入任务状态。",
        concepts=["Compact", "TaskManager", "JSON 持久化"],
    ),
]

