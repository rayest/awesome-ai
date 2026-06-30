from fastapi import APIRouter, Depends

from app.api.dependencies import get_github_mcp_service
from app.core.responses import success_response
from app.schemas.agent import GithubPlanRequest, GithubPlanResponse, McpConfigResponse
from app.schemas.common import ApiResponse
from app.services.github_mcp import GithubMcpService


router = APIRouter(prefix="/github-mcp", tags=["github-mcp"])


@router.get("/config", response_model=ApiResponse[McpConfigResponse])
async def github_mcp_config(
    service: GithubMcpService = Depends(get_github_mcp_service),
) -> ApiResponse[McpConfigResponse]:
    return success_response(service.config_preview())


@router.post("/plan", response_model=ApiResponse[GithubPlanResponse])
async def build_github_plan(
    request: GithubPlanRequest,
    service: GithubMcpService = Depends(get_github_mcp_service),
) -> ApiResponse[GithubPlanResponse]:
    result = await service.build_plan(request)
    return success_response(result)
