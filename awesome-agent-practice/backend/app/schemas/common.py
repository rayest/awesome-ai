from typing import Generic, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    response: T | None = None


class HealthResponse(BaseModel):
    status: str
    openai_enabled: bool
    github_mcp_enabled: bool
    model: str
