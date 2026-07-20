import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

from app.core.config import Settings


def configure_logging(settings: Settings) -> None:
    log_dir = Path(settings.log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    file_handler = TimedRotatingFileHandler(
        log_dir / settings.log_file,
        when="midnight",
        backupCount=settings.log_retention_days,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.suffix = "%Y-%m-%d"

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(settings.log_level.upper())
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
