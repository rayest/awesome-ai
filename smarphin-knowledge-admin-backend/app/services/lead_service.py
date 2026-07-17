import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.entities import Lead
from app.providers.web_fetcher import SafeWebFetcher
from app.repositories.admin import AdminRepository

logger = logging.getLogger(__name__)


class LeadService:
    def __init__(self, session: Session, repository: AdminRepository):
        self.session = session
        self.repository = repository

    def create_and_fetch(self, url: str, actor_id: int) -> dict:
        if self.repository.get_lead_by_url(url):
            raise HTTPException(status_code=409, detail="该来源已在线索池中")
        lead = Lead(url=url, status="new")
        self.session.add(lead)
        self.session.flush()
        try:
            logger.info("开始采集线索，lead_id=%s", lead.id)
            result = SafeWebFetcher().fetch(url)
            lead.title = result["title"]
            lead.raw_content = result["content"]
            lead.excerpt = result["content"][:500]
            logger.info("线索采集完成，lead_id=%s", lead.id)
        except Exception as exc:
            lead.status = "fetch_failed"
            lead.failure_reason = str(exc)[:1000]
            logger.warning("线索采集失败，lead_id=%s reason=%s", lead.id, type(exc).__name__)
        self.repository.audit(actor_id, "lead.create", "lead", lead.id, None, {"status": lead.status, "url": url})
        self.session.commit()
        return {"id": lead.id, "title": lead.title, "url": lead.url, "status": lead.status, "failure_reason": lead.failure_reason}
