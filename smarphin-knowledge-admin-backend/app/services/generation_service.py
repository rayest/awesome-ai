import logging
import time

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.entities import GenerationRun
from app.providers.openai_compatible import OpenAICompatibleProvider

logger = logging.getLogger(__name__)


class GenerationService:
    def __init__(self, session: Session):
        self.session = session

    def generate(self, article_id: int, source_text: str, prompt_version: str, actor_id: int) -> dict:
        settings = get_settings()
        run = GenerationRun(article_id=article_id, model=settings.openai_model, prompt_version=prompt_version, input_summary=source_text[:500], created_by=actor_id)
        self.session.add(run)
        self.session.commit()
        started = time.perf_counter()
        logger.info("开始生成文章草稿，run_id=%s article_id=%s", run.id, article_id)
        try:
            output = OpenAICompatibleProvider().generate_article(source_text)
            run.output_text = output
            run.status = "succeeded"
            logger.info("文章草稿生成完成，run_id=%s", run.id)
        except Exception as exc:
            run.status = "failed"
            run.error_message = str(exc)[:1000]
            logger.warning("文章草稿生成失败，run_id=%s reason=%s", run.id, type(exc).__name__)
        run.duration_ms = int((time.perf_counter() - started) * 1000)
        self.session.commit()
        return {"id": run.id, "status": run.status, "output_text": run.output_text, "error_message": run.error_message, "duration_ms": run.duration_ms}
