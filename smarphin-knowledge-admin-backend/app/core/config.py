from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Knowledge Admin API"
    app_env: str = "development"
    database_url: str = "sqlite:///./knowledge-admin.db"
    cors_origins: str = "http://localhost:5174"
    jwt_secret: str = "development-secret-change-before-production"
    access_token_minutes: int = 30
    refresh_token_days: int = 7
    openai_base_url: str = "https://api.openai.com/v1"
    openai_api_key: str = ""
    openai_model: str = "gpt-5-mini"
    upload_dir: str = "./uploads"
    public_media_base_url: str = "http://localhost:8102/media"
    oss_endpoint: str = ""
    oss_access_key_id: str = ""
    oss_access_key_secret: str = ""
    oss_bucket: str = ""
    oss_public_base_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
