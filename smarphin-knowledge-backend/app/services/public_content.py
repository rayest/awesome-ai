import hashlib
import logging
from datetime import datetime, timedelta

from fastapi import HTTPException

from app.repositories.content import ContentRepository
from app.core.config import get_settings
from app.schemas.public import ArticleOut, CatalogProfileOut, PodcastOut, ResourceOut, SubmissionCreate, TopicDetailOut, TopicOut

logger = logging.getLogger(__name__)


class PublicContentService:
    def __init__(self, repository: ContentRepository):
        self.repository = repository

    def articles(self, page: int, page_size: int, query: str | None = None, featured: bool | None = None):
        items, total = self.repository.list_articles(page, page_size, query, featured)
        return self._article_payloads(items), total

    def article(self, slug: str) -> dict:
        item = self.repository.get_article(slug)
        if not item:
            raise HTTPException(status_code=404, detail="内容不存在")
        return self._article_payloads([item])[0]

    def resources(self, page: int, page_size: int, resource_type: str | None = None, platform: str | None = None):
        items, total = self.repository.list_resources(page, page_size, resource_type, platform)
        return [ResourceOut.model_validate(item).model_dump(exclude={"content", "instructions", "variables"}) for item in items], total

    def resource(self, slug: str) -> dict:
        item = self.repository.get_resource(slug)
        if not item:
            raise HTTPException(status_code=404, detail="资源不存在")
        return ResourceOut.model_validate(item).model_dump()

    def profiles(self, profile_type: str):
        return [CatalogProfileOut.model_validate(item).model_dump() for item in self.repository.list_profiles(profile_type)]

    def _article_payloads(self, items) -> list[dict]:
        categories = self.repository.get_categories({item.category_id for item in items if item.category_id})
        payloads = []
        for item in items:
            payload = ArticleOut.model_validate(item).model_dump()
            category = categories.get(item.category_id)
            payload["category_slug"] = category.slug if category else None
            payload["category_name"] = category.name if category else None
            payloads.append(payload)
        return payloads

    def topics(self) -> list[dict]:
        items = self.repository.list_topics()
        counts = self.repository.topic_article_counts([item.id for item in items])
        payloads = []
        for item in items:
            payload = TopicOut.model_validate(item).model_dump()
            payload["article_count"] = counts.get(item.id, 0)
            payloads.append(payload)
        return payloads

    def topic(self, slug: str) -> dict:
        item = self.repository.get_topic(slug)
        if not item:
            raise HTTPException(status_code=404, detail="专题不存在")
        payload = TopicOut.model_validate(item).model_dump()
        payload["articles"] = self._article_payloads(self.repository.list_topic_articles(item.id))
        return TopicDetailOut.model_validate(payload).model_dump()

    def podcasts(self) -> list[dict]:
        return [PodcastOut.model_validate(item).model_dump() for item in self.repository.list_podcasts()]

    def podcast(self, slug: str) -> dict:
        item = self.repository.get_podcast(slug)
        if not item:
            raise HTTPException(status_code=404, detail="播客不存在")
        return PodcastOut.model_validate(item).model_dump()

    def submit(self, payload: SubmissionCreate, requester_ip: str) -> dict:
        if payload.website:
            raise HTTPException(status_code=400, detail="提交未通过校验")
        ip_hash = hashlib.sha256(requester_ip.encode("utf-8")).hexdigest()
        limit = get_settings().rate_limit_submissions_per_hour
        if self.repository.recent_submission_count(ip_hash, datetime.utcnow() - timedelta(hours=1)) >= limit:
            raise HTTPException(status_code=429, detail="提交过于频繁，请稍后再试")
        data = payload.model_dump(exclude={"website"})
        data["source_url"] = str(payload.source_url)
        item = self.repository.create_submission(data, ip_hash)
        logger.info("匿名线索已入库，submission_id=%s", item.id)
        return {"id": item.id, "status": item.status}
