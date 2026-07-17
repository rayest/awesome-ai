import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Article, AuditLog

logger = logging.getLogger(__name__)


def publish_due_articles(session: Session) -> int:
    articles = session.scalars(
        select(Article).where(
            Article.status == "scheduled",
            Article.scheduled_at <= datetime.utcnow(),
            Article.is_deleted.is_(False),
        )
    ).all()
    for article in articles:
        before = {"status": article.status, "scheduled_at": str(article.scheduled_at)}
        article.status = "published"
        article.published_at = datetime.utcnow()
        article.scheduled_at = None
        session.add(AuditLog(action="article.auto_publish", target_type="article", target_id=article.id, before_state=before, after_state={"status": "published"}))
        logger.info("定时文章已发布，article_id=%s", article.id)
    session.commit()
    return len(articles)
