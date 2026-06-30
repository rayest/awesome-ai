from app.core.config import get_settings
from app.services.function_calling import FunctionCallingService
from app.services.github_mcp import GithubMcpService


def get_function_calling_service() -> FunctionCallingService:
    return FunctionCallingService(get_settings())


def get_github_mcp_service() -> GithubMcpService:
    return GithubMcpService(get_settings())
