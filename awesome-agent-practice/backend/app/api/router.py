from fastapi import APIRouter

from app.api.function_calling import router as function_calling_router
from app.api.github_mcp import router as github_mcp_router
from app.api.health import router as health_router
from app.api.practice_theory import router as practice_theory_router


api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(function_calling_router)
api_router.include_router(github_mcp_router)
api_router.include_router(practice_theory_router)
