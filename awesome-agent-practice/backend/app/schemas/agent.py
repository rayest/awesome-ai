from typing import Any, Literal

from pydantic import BaseModel, Field


ToolMode = Literal["mock", "openai"]
PracticeMode = Literal["read_only", "propose", "execute"]
RiskLevel = Literal["low", "medium", "high"]


class ToolCall(BaseModel):
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    result: dict[str, Any] = Field(default_factory=dict)


class FunctionCallRequest(BaseModel):
    prompt: str = Field(min_length=2, examples=["查看客户 C-1001 最近订单和退款建议"])
    mode: ToolMode = "mock"


class FunctionCallResponse(BaseModel):
    answer: str
    selected_tool: str
    tool_calls: list[ToolCall]
    business_data: dict[str, Any] = Field(default_factory=dict)
    recommendations: list[str] = Field(default_factory=list)


class GithubPlanStep(BaseModel):
    id: int
    title: str
    purpose: str
    mcp_toolset: str
    expected_evidence: str
    risk: RiskLevel = "low"


class GithubPlanRequest(BaseModel):
    repo: str = Field(pattern=r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", examples=["openai/openai-agents-python"])
    task: str = Field(min_length=4, examples=["分析最近失败的 GitHub Actions，并创建修复 Issue 草稿"])
    mode: PracticeMode = "read_only"


class GithubPlanResponse(BaseModel):
    repo: str
    task_summary: str
    mode: PracticeMode
    mcp_server: dict[str, Any]
    steps: list[GithubPlanStep]
    write_actions: list[str]
    approval_required: bool
    next_action: str
    safety_notes: list[str]


class McpConfigResponse(BaseModel):
    enabled: bool
    server: dict[str, Any]
    headers: dict[str, str]
    learning_notes: list[str]
