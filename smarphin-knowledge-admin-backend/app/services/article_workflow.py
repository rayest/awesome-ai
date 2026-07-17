import logging
import re
from datetime import datetime

from fastapi import HTTPException

from app.models.entities import Article
from app.repositories.admin import AdminRepository
from app.schemas.admin import ArticleCreate, ArticleOut, ArticleUpdate

logger = logging.getLogger(__name__)


class ArticleWorkflow:
    transitions = {
        "draft": {"reviewing", "archived"},
        "reviewing": {"draft", "scheduled", "published", "archived"},
        "scheduled": {"draft", "published", "archived"},
        "published": {"draft", "archived"},
        "archived": {"draft"},
    }

    def __init__(self, repository: AdminRepository):
        self.repository = repository

    def create(self, payload: ArticleCreate, actor_id: int) -> dict:
        data = payload.model_dump()
        data["content_text"] = self._plain_text(data["content_markdown"])
        article = self.repository.save_article(Article(**data, created_by=actor_id, updated_by=actor_id))
        self.repository.audit(actor_id, "article.create", "article", article.id, None, {"status": article.status, "title": article.title})
        self.repository.commit()
        logger.info("文章草稿已创建，article_id=%s actor_id=%s", article.id, actor_id)
        return ArticleOut.model_validate(article).model_dump()

    def update(self, article_id: int, payload: ArticleUpdate, actor_id: int) -> dict:
        article = self._get(article_id)
        before = {"status": article.status, "title": article.title}
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(article, field, value)
        if payload.content_markdown is not None:
            article.content_text = self._plain_text(payload.content_markdown)
        article.updated_by = actor_id
        self.repository.audit(actor_id, "article.update", "article", article.id, before, {"status": article.status, "title": article.title})
        self.repository.commit()
        return ArticleOut.model_validate(article).model_dump()

    def transition(self, article_id: int, target: str, actor_id: int, scheduled_at: datetime | None = None) -> dict:
        article = self._get(article_id)
        if target not in self.transitions.get(article.status, set()):
            raise HTTPException(status_code=409, detail=f"不能从 {article.status} 变更为 {target}")
        if target == "scheduled" and not scheduled_at:
            raise HTTPException(status_code=422, detail="定时发布必须设置时间")
        before = {"status": article.status, "scheduled_at": str(article.scheduled_at)}
        article.status = target
        article.scheduled_at = scheduled_at if target == "scheduled" else None
        if target == "published":
            article.published_at = datetime.utcnow()
        article.updated_by = actor_id
        self.repository.audit(actor_id, f"article.{target}", "article", article.id, before, {"status": target, "scheduled_at": str(article.scheduled_at)})
        self.repository.commit()
        logger.info("文章状态已变更，article_id=%s target=%s actor_id=%s", article.id, target, actor_id)
        return ArticleOut.model_validate(article).model_dump()

    def _get(self, article_id: int) -> Article:
        article = self.repository.get_article(article_id)
        if not article or article.is_deleted:
            raise HTTPException(status_code=404, detail="文章不存在")
        return article

    @staticmethod
    def _plain_text(markdown: str) -> str:
        return re.sub(r"[#*_>`\[\]()]", " ", markdown)
