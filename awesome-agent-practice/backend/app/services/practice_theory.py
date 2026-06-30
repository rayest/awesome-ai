from fastapi import HTTPException

from app.schemas.agent import PracticeTheoryResponse, TheoryLab


THEORY_CONTENT: dict[TheoryLab, PracticeTheoryResponse] = {
    "function": PracticeTheoryResponse(
        lab="function",
        title="Function Calling 原理",
        summary="Function Calling 把模型的自然语言判断和确定性业务函数分开：模型只决定调用哪个工具和传什么参数，业务结果由后端函数返回。",
        points=[
            "工具 schema 约束模型可以调用的能力边界。",
            "后端函数负责真实业务查询、计算和校验。",
            "练习区主接口只返回业务答案，工具选择过程放到这里按需查看。",
        ],
        details={
            "flow": ["用户输入", "选择业务工具", "执行后端函数", "返回业务答案"],
            "safe_boundary": "正式写操作前应增加审批、幂等和审计记录。",
        },
    ),
    "github": PracticeTheoryResponse(
        lab="github",
        title="GitHub MCP 原理",
        summary="MCP 把 GitHub 的读取和写入能力包装成 Agent 可用工具。练习项目默认从只读计划开始，避免模型直接执行高风险写操作。",
        points=[
            "只读模式先收集 repo、issue、PR 和 CI 证据。",
            "propose 模式只生成草稿，不直接提交。",
            "execute 模式必须保留二次确认和可审计记录。",
        ],
        details={
            "toolsets": ["repos", "issues", "pull_requests", "actions"],
            "approval": "写 GitHub 前必须等待用户确认。",
        },
    ),
}


class PracticeTheoryService:
    def get_theory(self, lab: TheoryLab) -> PracticeTheoryResponse:
        theory = THEORY_CONTENT.get(lab)
        if not theory:
            raise HTTPException(status_code=404, detail="练习主题不存在")
        return theory
