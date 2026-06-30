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
            learning_notes=[
                "GitHub MCP 是 GitHub API 外面面向 Agent 的工具层。",
                "练习项目默认只暴露 repos、issues、pull_requests、actions，避免一开始给 Agent 过大权限。",
                "生产环境不要把 token 写入配置文件，统一用环境变量注入。",
            ],
        )

    async def build_plan(self, request: GithubPlanRequest) -> GithubPlanResponse:
        write_actions = self._write_actions_for_mode(request.mode)
        return GithubPlanResponse(
            repo=request.repo,
            task_summary=request.task,
            mode=request.mode,
            mcp_server=self.config_preview().server,
            steps=self._build_steps(write_actions),
            write_actions=write_actions,
            approval_required=bool(write_actions) or request.mode != "read_only",
            next_action=self._next_action(request.mode),
            safety_notes=self._safety_notes(),
        )

    def _build_steps(self, write_actions: list[str]) -> list[GithubPlanStep]:
        steps = [
            GithubPlanStep(
                id=1,
                title="确认仓库上下文",
                purpose="读取 repo 基本信息、默认分支和最近活动，避免对错误仓库做判断。",
                mcp_toolset="repos",
                expected_evidence="仓库名称、默认分支、最近提交或 release 信息",
                risk="low",
            ),
            GithubPlanStep(
                id=2,
                title="读取最近 PR 和 Issue",
                purpose="判断任务是否已有上下文，避免重复创建 issue 或漏掉相关 PR。",
                mcp_toolset="issues,pull_requests",
                expected_evidence="相关 open issues、recent pull requests、labels",
                risk="low",
            ),
            GithubPlanStep(
                id=3,
                title="检查 GitHub Actions 状态",
                purpose="如果任务涉及 CI，读取最近 workflow runs 和失败 job 摘要。",
                mcp_toolset="actions",
                expected_evidence="失败 workflow、job 名称、失败时间、日志摘要",
                risk="low",
            ),
            GithubPlanStep(
                id=4,
                title="生成执行建议",
                purpose="把 MCP 读到的证据整理成可执行计划，明确下一步是否需要写 GitHub。",
                mcp_toolset="local:function_calling",
                expected_evidence="问题假设、证据列表、建议动作",
                risk="medium",
            ),
            GithubPlanStep(
                id=5,
                title="等待人工审批",
                purpose="计划模式下先停住，高风险或写操作必须由用户确认。",
                mcp_toolset="approval_gate",
                expected_evidence="用户批准或拒绝",
                risk="medium" if write_actions else "low",
            ),
        ]
        return steps

    def _safety_notes(self) -> list[str]:
        return [
            "read_only 模式只读取 GitHub 证据，不创建或修改任何 GitHub 资源。",
            "propose 模式只生成 Issue / PR 评论草稿，不提交。",
            "execute 模式也必须保留二次确认，避免 Agent 自行执行写操作。",
        ]

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
