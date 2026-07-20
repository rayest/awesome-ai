from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Knowledge Public API"
    app_env: str = "development"
    app_port: int = 19093
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_db: str = "smarphin_knowledge_hub"
    cors_origins: str = "http://localhost:19092,http://127.0.0.1:19092"
    public_site_url: str = "http://localhost:19092"
    rate_limit_submissions_per_hour: int = 8
    log_dir: str = "./logs"
    log_file: str = "public-api.log"
    log_level: str = "INFO"
    log_retention_days: int = 14

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
