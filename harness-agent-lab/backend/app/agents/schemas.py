from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


class AgentPattern(str, Enum):
    intent = "intent"
    react = "react"
    plan_act = "plan_act"
    reflection = "reflection"
    codeact = "codeact"
    hitl = "hitl"
    deep_research = "deep_research"
    memory = "memory"
    skills = "skills"
    manager_subagent = "manager_subagent"
    compact_task = "compact_task"


class PatternInfo(BaseModel):
    id: AgentPattern
    title: str
    chapter: str
    summary: str
    concepts: list[str]


class AgentRunRequest(BaseModel):
    pattern: AgentPattern
    input: str = Field(min_length=1)
    session_id: str = "demo"
    human_reply: str | None = None
    use_llm: bool = False


class TraceStep(BaseModel):
    phase: str
    title: str
    detail: str
    payload: dict[str, Any] = Field(default_factory=dict)


class AgentRunResponse(BaseModel):
    pattern: AgentPattern
    mode: Literal["mock", "llm"]
    status: Literal["completed", "waiting_human", "error"]
    answer: str
    trace: list[TraceStep]
    artifacts: dict[str, Any] = Field(default_factory=dict)

