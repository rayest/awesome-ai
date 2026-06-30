from fastapi import APIRouter

from app.core.config import get_settings
from app.core.responses import success_response
from app.schemas.common import ApiResponse, HealthResponse


router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=ApiResponse[HealthResponse])
async def health() -> ApiResponse[HealthResponse]:
    settings = get_settings()
    return success_response(
        HealthResponse(
            status="ok",
            openai_enabled=settings.openai_enabled,
            github_mcp_enabled=settings.github_mcp_enabled,
            model=settings.openai_model,
        )
    )
