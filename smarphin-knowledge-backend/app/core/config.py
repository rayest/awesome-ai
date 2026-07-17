from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Knowledge Public API"
    app_env: str = "development"
    database_url: str = "sqlite:///./knowledge-public.db"
    cors_origins: str = "http://localhost:3000"
    public_site_url: str = "http://localhost:3000"
    rate_limit_submissions_per_hour: int = 8

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
