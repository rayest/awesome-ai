from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.entities import Article, CatalogProfile, Category, LibraryResource, Podcast, Submission, Topic, topic_articles


class ContentRepository:
    def __init__(self, session: Session):
        self.session = session

    @staticmethod
    def _published(model):
        return (model.status == "published", model.published_at <= datetime.utcnow())

    def list_articles(self, page: int, page_size: int, query: str | None = None, featured: bool | None = None):
        filters = [*self._published(Article), Article.is_deleted.is_(False), Article.category_id.is_not(None)]
        if query:
            term = f"%{query}%"
            filters.append(or_(Article.title.like(term), Article.summary.like(term), Article.content_text.like(term)))
        if featured is not None:
            filters.append(Article.featured.is_(featured))
        statement = select(Article).where(*filters).order_by(Article.published_at.desc())
        count_statement = select(func.count()).select_from(Article).where(*filters)
        items = self.session.scalars(statement.offset((page - 1) * page_size).limit(page_size)).all()
        return list(items), int(self.session.scalar(count_statement) or 0)

    def get_article(self, slug: str) -> Article | None:
        statement = select(Article).where(Article.slug == slug, *self._published(Article), Article.is_deleted.is_(False), Article.category_id.is_not(None))
        return self.session.scalar(statement)

    def list_resources(self, page: int, page_size: int, resource_type: str | None = None, platform: str | None = None):
        filters = [*self._published(LibraryResource), LibraryResource.is_deleted.is_(False)]
        if resource_type:
            filters.append(LibraryResource.resource_type == resource_type)
        if platform:
            filters.append(LibraryResource.platform == platform)
        statement = select(LibraryResource).where(*filters).order_by(LibraryResource.featured.desc(), LibraryResource.published_at.desc())
        count_statement = select(func.count()).select_from(LibraryResource).where(*filters)
        items = self.session.scalars(statement.offset((page - 1) * page_size).limit(page_size)).all()
        return list(items), int(self.session.scalar(count_statement) or 0)

    def get_resource(self, slug: str) -> LibraryResource | None:
        return self.session.scalar(select(LibraryResource).where(LibraryResource.slug == slug, *self._published(LibraryResource), LibraryResource.is_deleted.is_(False)))

    def list_profiles(self, profile_type: str):
        return list(self.session.scalars(select(CatalogProfile).where(CatalogProfile.profile_type == profile_type, *self._published(CatalogProfile), CatalogProfile.is_deleted.is_(False)).order_by(CatalogProfile.name)).all())

    def get_categories(self, category_ids: set[int]) -> dict[int, Category]:
        if not category_ids:
            return {}
        items = self.session.scalars(select(Category).where(Category.id.in_(category_ids))).all()
        return {item.id: item for item in items}

    def list_topics(self):
        return list(self.session.scalars(select(Topic).where(*self._published(Topic)).order_by(Topic.published_at.desc())).all())

    def topic_article_counts(self, topic_ids: list[int]) -> dict[int, int]:
        if not topic_ids:
            return {}
        statement = (
            select(topic_articles.c.topic_id, func.count(topic_articles.c.article_id))
            .join(Article, Article.id == topic_articles.c.article_id)
            .where(topic_articles.c.topic_id.in_(topic_ids), *self._published(Article), Article.is_deleted.is_(False), Article.category_id.is_not(None))
            .group_by(topic_articles.c.topic_id)
        )
        return {topic_id: count for topic_id, count in self.session.execute(statement)}

    def get_topic(self, slug: str) -> Topic | None:
        return self.session.scalar(select(Topic).where(Topic.slug == slug, *self._published(Topic)))

    def list_topic_articles(self, topic_id: int) -> list[Article]:
        statement = (
            select(Article)
            .join(topic_articles, topic_articles.c.article_id == Article.id)
            .where(topic_articles.c.topic_id == topic_id, *self._published(Article), Article.is_deleted.is_(False), Article.category_id.is_not(None))
            .order_by(topic_articles.c.position, Article.published_at.desc())
        )
        return list(self.session.scalars(statement).all())

    def list_podcasts(self):
        return list(self.session.scalars(select(Podcast).where(*self._published(Podcast)).order_by(Podcast.published_at.desc())).all())

    def get_podcast(self, slug: str) -> Podcast | None:
        return self.session.scalar(select(Podcast).where(Podcast.slug == slug, *self._published(Podcast)))

    def create_submission(self, payload: dict, requester_ip_hash: str) -> Submission:
        submission = Submission(**payload, requester_ip_hash=requester_ip_hash)
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        return submission

    def recent_submission_count(self, requester_ip_hash: str, since: datetime) -> int:
        statement = select(func.count()).select_from(Submission).where(Submission.requester_ip_hash == requester_ip_hash, Submission.created_at >= since)
        return int(self.session.scalar(statement) or 0)
