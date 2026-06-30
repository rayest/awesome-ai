from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1-mini"
    github_token: str = ""
    github_mcp_url: str = "https://api.githubcopilot.com/mcp/"
    github_mcp_toolsets: str = "repos,issues,pull_requests,actions"
    github_mcp_readonly: bool = True
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    @property
    def openai_enabled(self) -> bool:
        return bool(self.openai_api_key)

    @property
    def github_mcp_enabled(self) -> bool:
        return bool(self.github_token)


@lru_cache
def get_settings() -> Settings:
    return Settings()

