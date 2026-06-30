from app.core.config import Settings
from app.schemas.agent import GithubPlanRequest, GithubPlanResponse, GithubPlanStep, McpConfigResponse


class GithubMcpService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def config_preview(self) -> McpConfigResponse:
        headers = {
            "Authorization": "Bearer ${GITHUB_TOKEN}",
            "X-MCP-Toolsets": self.settings.github_mcp_toolsets,
            "X-MCP-Readonly": str(self.settings.github_mcp_readonly).lower(),
        }
        server = {
            "type": "http",
            "url": self.settings.github_mcp_url,
            "transport": "streamable_http",
            "toolsets": self.settings.github_mcp_toolsets.split(","),
            "readonly": self.settings.github_mcp_readonly,
        }
        return McpConfigResponse(
            enabled=self.settings.github_mcp_enabled,
            server=server,
            headers=headers,
        )

    async def build_plan(self, request: GithubPlanRequest) -> GithubPlanResponse:
        write_actions = self._write_actions_for_mode(request.mode)
        return GithubPlanResponse(
            repo=request.repo,
            task_summary=request.task,
            mode=request.mode,
            steps=self._build_steps(write_actions),
            write_actions=write_actions,
            approval_required=bool(write_actions) or request.mode != "read_only",
            next_action=self._next_action(request.mode),
        )

    def _build_steps(self, write_actions: list[str]) -> list[GithubPlanStep]:
        steps = [
            GithubPlanStep(
                id=1,
                title="确认仓库上下文",
                purpose="读取 repo 基本信息、默认分支和最近活动，避免对错误仓库做判断。",
                risk="low",
            ),
            GithubPlanStep(
                id=2,
                title="读取最近 PR 和 Issue",
                purpose="判断任务是否已有上下文，避免重复创建 issue 或漏掉相关 PR。",
                risk="low",
            ),
            GithubPlanStep(
                id=3,
                title="检查 GitHub Actions 状态",
                purpose="如果任务涉及 CI，读取最近 workflow runs 和失败 job 摘要。",
                risk="low",
            ),
            GithubPlanStep(
                id=4,
                title="生成执行建议",
                purpose="把 MCP 读到的证据整理成可执行计划，明确下一步是否需要写 GitHub。",
                risk="medium",
            ),
            GithubPlanStep(
                id=5,
                title="等待人工审批",
                purpose="计划模式下先停住，高风险或写操作必须由用户确认。",
                risk="medium" if write_actions else "low",
            ),
        ]
        return steps

    def _write_actions_for_mode(self, mode: str) -> list[str]:
        if mode == "execute":
            return ["create_issue", "add_pull_request_comment"]
        if mode == "propose":
            return ["draft_issue", "draft_pull_request_comment"]
        return []

    def _next_action(self, mode: str) -> str:
        if mode == "read_only":
            return "运行真实 GitHub MCP 读工具后，展示证据和计划。"
        if mode == "propose":
            return "生成 Issue 或 PR 评论草稿，等待用户确认。"
        return "二次确认后调用 GitHub MCP 写工具。"
