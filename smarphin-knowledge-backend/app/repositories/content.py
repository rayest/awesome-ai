from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.entities import Article, Podcast, Submission, Topic


class ContentRepository:
    def __init__(self, session: Session):
        self.session = session

    @staticmethod
    def _published(model):
        return (model.status == "published", model.published_at <= datetime.utcnow())

    def list_articles(self, page: int, page_size: int, query: str | None = None, featured: bool | None = None):
        filters = [*self._published(Article), Article.is_deleted.is_(False)]
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
        statement = select(Article).where(Article.slug == slug, *self._published(Article), Article.is_deleted.is_(False))
        return self.session.scalar(statement)

    def list_topics(self):
        return list(self.session.scalars(select(Topic).where(*self._published(Topic)).order_by(Topic.published_at.desc())).all())

    def get_topic(self, slug: str) -> Topic | None:
        return self.session.scalar(select(Topic).where(Topic.slug == slug, *self._published(Topic)))

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
