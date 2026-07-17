from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entities import Article, AuditLog, Lead


class AdminRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_articles(self, page: int, page_size: int, status: str | None = None):
        filters = [Article.is_deleted.is_(False)]
        if status:
            filters.append(Article.status == status)
        query = select(Article).where(*filters).order_by(Article.updated_at.desc())
        count_query = select(func.count()).select_from(Article).where(*filters)
        return list(self.session.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()), int(self.session.scalar(count_query) or 0)

    def get_article(self, article_id: int) -> Article | None:
        return self.session.get(Article, article_id)

    def save_article(self, article: Article) -> Article:
        self.session.add(article)
        self.session.flush()
        return article

    def list_leads(self, page: int, page_size: int, status: str | None = None):
        filters = [Lead.status == status] if status else []
        query = select(Lead).where(*filters).order_by(Lead.created_at.desc())
        count_query = select(func.count()).select_from(Lead).where(*filters)
        return list(self.session.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()), int(self.session.scalar(count_query) or 0)

    def get_lead_by_url(self, url: str) -> Lead | None:
        return self.session.scalar(select(Lead).where(Lead.url == url))

    def audit(self, actor_id: int, action: str, target_type: str, target_id: int | None, before: dict | None, after: dict | None):
        self.session.add(AuditLog(actor_id=actor_id, action=action, target_type=target_type, target_id=target_id, before_state=before, after_state=after))

    def commit(self):
        self.session.commit()
