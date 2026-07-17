import logging

import feedparser
import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.entities import Lead, Source, SyncRun
from app.providers.web_fetcher import SafeWebFetcher

logger = logging.getLogger(__name__)


def sync_source(session: Session, source: Source) -> SyncRun:
    run = SyncRun(source_id=source.id, run_type="rss", status="running")
    session.add(run)
    session.commit()
    logger.info("开始同步 RSS，source_id=%s run_id=%s", source.id, run.id)
    try:
        SafeWebFetcher().validate_url(source.rss_url or "")
        response = httpx.get(source.rss_url, timeout=20, follow_redirects=True)
        response.raise_for_status()
        if len(response.content) > 5 * 1024 * 1024:
            raise ValueError("RSS 响应超过 5MB")
        feed = feedparser.loads(response.content)
        run.discovered_count = len(feed.entries)
        for entry in feed.entries[:100]:
            url = str(entry.get("link", ""))
            if not url or session.scalar(select(Lead.id).where(Lead.url == url)):
                continue
            session.add(Lead(source_id=source.id, url=url, title=str(entry.get("title", ""))[:300], excerpt=str(entry.get("summary", ""))[:2000]))
            run.created_count += 1
        run.status = "succeeded"
        logger.info("RSS 同步完成，run_id=%s discovered=%s created=%s", run.id, run.discovered_count, run.created_count)
    except Exception as exc:
        run.status = "failed"
        run.failure_reason = str(exc)[:1000]
        logger.warning("RSS 同步失败，run_id=%s reason=%s", run.id, type(exc).__name__)
    session.commit()
    return run


def sync_all_sources(session: Session) -> list[SyncRun]:
    sources = session.scalars(select(Source).where(Source.is_active.is_(True), Source.rss_url.is_not(None))).all()
    return [sync_source(session, source) for source in sources]
