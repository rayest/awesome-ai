from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.entities import Article, AuditLog, CatalogProfile, Lead, LibraryResource


class AdminRepository:
    def __init__(self, session: Session):
        self.session = session

    def list_articles(self, page: int, page_size: int, status: str | None = None, query_text: str | None = None):
        filters = [Article.is_deleted.is_(False)]
        if status:
            filters.append(Article.status == status)
        if query_text:
            term = f"%{query_text}%"
            filters.append(or_(Article.title.like(term), Article.summary.like(term), Article.slug.like(term)))
        query = select(Article).where(*filters).order_by(Article.updated_at.desc())
        count_query = select(func.count()).select_from(Article).where(*filters)
        return list(self.session.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()), int(self.session.scalar(count_query) or 0)

    def get_article(self, article_id: int) -> Article | None:
        return self.session.get(Article, article_id)

    def save_article(self, article: Article) -> Article:
        self.session.add(article)
        self.session.flush()
        return article

    def list_resources(self, page: int, page_size: int, status: str | None = None):
        filters = [LibraryResource.is_deleted.is_(False)]
        if status:
            filters.append(LibraryResource.status == status)
        query = select(LibraryResource).where(*filters).order_by(LibraryResource.updated_at.desc())
        count_query = select(func.count()).select_from(LibraryResource).where(*filters)
        items = self.session.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()
        return list(items), int(self.session.scalar(count_query) or 0)

    def get_resource(self, resource_id: int) -> LibraryResource | None:
        return self.session.get(LibraryResource, resource_id)

    def save_resource(self, resource: LibraryResource) -> LibraryResource:
        self.session.add(resource)
        self.session.flush()
        return resource

    def list_profiles(self, profile_type: str | None = None):
        filters = [CatalogProfile.is_deleted.is_(False)]
        if profile_type:
            filters.append(CatalogProfile.profile_type == profile_type)
        return list(self.session.scalars(select(CatalogProfile).where(*filters).order_by(CatalogProfile.updated_at.desc())).all())

    def get_profile(self, profile_id: int):
        return self.session.get(CatalogProfile, profile_id)

    def save_profile(self, profile: CatalogProfile):
        self.session.add(profile); self.session.flush(); return profile

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
