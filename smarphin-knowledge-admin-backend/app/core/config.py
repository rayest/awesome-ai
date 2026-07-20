from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Knowledge Admin API"
    app_env: str = "development"
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_db: str = "smarphin_knowledge_hub"
    cors_origins: str = "http://localhost:19091,http://127.0.0.1:19091"
    jwt_secret: str = "development-secret-change-before-production"
    access_token_minutes: int = 30
    refresh_token_days: int = 7
    openai_base_url: str = "https://api.openai.com/v1"
    openai_api_key: str = ""
    openai_model: str = "gpt-5-mini"
    upload_dir: str = "./uploads"
    public_media_base_url: str = "http://localhost:19090/media"
    log_dir: str = "./logs"
    log_file: str = "admin-api.log"
    log_level: str = "INFO"
    log_retention_days: int = 14
    oss_endpoint: str = ""
    oss_access_key_id: str = ""
    oss_access_key_secret: str = ""
    oss_bucket: str = ""
    oss_public_base_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        from urllib.parse import quote_plus

        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        auth = f"{user}:{password}" if self.mysql_password else user
        return f"mysql+pymysql://{auth}@{self.mysql_host}:{self.mysql_port}/{self.mysql_db}?charset=utf8mb4"

    @property
    def allowed_origins(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
