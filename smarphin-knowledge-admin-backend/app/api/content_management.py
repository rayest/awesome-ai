import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.core.security import current_admin
from app.models.entities import (
    AdminAccount, Article, AuditLog, Category, GenerationRun, Podcast, Source,
    Submission, SyncRun, Topic, topic_articles,
)
from app.repositories.admin import AdminRepository
from app.schemas.admin import CategoryInput, LeadUpdate, PodcastInput, SourceInput, SubmissionStatusInput, TopicInput

router = APIRouter(prefix="/api/admin", tags=["content-management"])
logger = logging.getLogger(__name__)


def _actor(admin: AdminAccount) -> int:
    return admin.id


def _commit(session: Session, repo: AdminRepository, actor_id: int, action: str, target_type: str, item, before=None):
    after = {"id": item.id, "status": getattr(item, "status", None), "name": getattr(item, "name", None), "title": getattr(item, "title", None)}
    repo.audit(actor_id, action, target_type, item.id, before, after)
    session.commit(); session.refresh(item)
    logger.info("内容管理操作完成，action=%s target_type=%s target_id=%s actor_id=%s", action, target_type, item.id, actor_id)
    return success(item)


@router.get("/categories")
def list_categories(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return success(list(session.scalars(select(Category).order_by(Category.name)).all()))


@router.post("/categories", status_code=201)
def create_category(payload: CategoryInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = Category(**payload.model_dump()); session.add(item); session.flush()
    return _commit(session, AdminRepository(session), _actor(admin), "category.create", "category", item)


@router.put("/categories/{item_id}")
def update_category(item_id: int, payload: CategoryInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Category, item_id)
    if not item: raise HTTPException(404, "分类不存在")
    before = {"slug": item.slug, "name": item.name}
    for key, value in payload.model_dump().items(): setattr(item, key, value)
    return _commit(session, AdminRepository(session), _actor(admin), "category.update", "category", item, before)


@router.get("/topics")
def list_topics(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    items = list(session.scalars(select(Topic).order_by(Topic.updated_at.desc())).all())
    article_rows = session.execute(select(topic_articles.c.topic_id, topic_articles.c.article_id).order_by(topic_articles.c.position)).all()
    mapping: dict[int, list[int]] = {}
    for topic_id, article_id in article_rows: mapping.setdefault(topic_id, []).append(article_id)
    return success([{**item.__dict__, "article_ids": mapping.get(item.id, [])} for item in items])


def _save_topic_articles(session: Session, topic_id: int, article_ids: list[int]):
    session.execute(delete(topic_articles).where(topic_articles.c.topic_id == topic_id))
    for position, article_id in enumerate(article_ids):
        session.execute(topic_articles.insert().values(topic_id=topic_id, article_id=article_id, position=position))


@router.post("/topics", status_code=201)
def create_topic(payload: TopicInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    data = payload.model_dump(exclude={"article_ids"}); item = Topic(**data); session.add(item); session.flush()
    _save_topic_articles(session, item.id, payload.article_ids)
    return _commit(session, AdminRepository(session), _actor(admin), "topic.create", "topic", item)


@router.put("/topics/{item_id}")
def update_topic(item_id: int, payload: TopicInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Topic, item_id)
    if not item: raise HTTPException(404, "专题不存在")
    before = {"title": item.title, "status": item.status}
    for key, value in payload.model_dump(exclude={"article_ids"}).items(): setattr(item, key, value)
    _save_topic_articles(session, item.id, payload.article_ids)
    return _commit(session, AdminRepository(session), _actor(admin), "topic.update", "topic", item, before)


@router.post("/topics/{item_id}/{target}")
def transition_topic(item_id: int, target: str, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Topic, item_id)
    if not item or target not in {"draft", "published", "archived"}: raise HTTPException(422, "专题或目标状态不合法")
    before = {"status": item.status}; item.status = target
    if target == "published": item.published_at = datetime.utcnow()
    return _commit(session, AdminRepository(session), _actor(admin), f"topic.{target}", "topic", item, before)


@router.get("/podcasts")
def list_podcasts(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return success(list(session.scalars(select(Podcast).order_by(Podcast.updated_at.desc())).all()))


@router.post("/podcasts", status_code=201)
def create_podcast(payload: PodcastInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = Podcast(**payload.model_dump()); session.add(item); session.flush()
    return _commit(session, AdminRepository(session), _actor(admin), "podcast.create", "podcast", item)


@router.put("/podcasts/{item_id}")
def update_podcast(item_id: int, payload: PodcastInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Podcast, item_id)
    if not item: raise HTTPException(404, "播客不存在")
    before = {"title": item.title, "status": item.status}
    for key, value in payload.model_dump().items(): setattr(item, key, value)
    return _commit(session, AdminRepository(session), _actor(admin), "podcast.update", "podcast", item, before)


@router.post("/podcasts/{item_id}/{target}")
def transition_podcast(item_id: int, target: str, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Podcast, item_id)
    if not item or target not in {"draft", "published", "archived"}: raise HTTPException(422, "播客或目标状态不合法")
    before = {"status": item.status}; item.status = target
    if target == "published": item.published_at = datetime.utcnow()
    return _commit(session, AdminRepository(session), _actor(admin), f"podcast.{target}", "podcast", item, before)


@router.get("/sources")
def list_sources(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return success(list(session.scalars(select(Source).order_by(Source.updated_at.desc())).all()))


@router.post("/sources", status_code=201)
def create_source(payload: SourceInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    data = payload.model_dump(); data["url"] = str(payload.url); data["rss_url"] = str(payload.rss_url) if payload.rss_url else None
    item = Source(**data); session.add(item); session.flush()
    return _commit(session, AdminRepository(session), _actor(admin), "source.create", "source", item)


@router.put("/sources/{item_id}")
def update_source(item_id: int, payload: SourceInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Source, item_id)
    if not item: raise HTTPException(404, "来源不存在")
    before = {"name": item.name, "url": item.url}; data = payload.model_dump(); data["url"] = str(payload.url); data["rss_url"] = str(payload.rss_url) if payload.rss_url else None
    for key, value in data.items(): setattr(item, key, value)
    return _commit(session, AdminRepository(session), _actor(admin), "source.update", "source", item, before)


@router.get("/submissions")
def list_submissions(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), status: str | None = None, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    filters = [Submission.status == status] if status else []
    query = select(Submission).where(*filters).order_by(Submission.created_at.desc())
    items = session.scalars(query.offset((page_number - 1) * page_size).limit(page_size)).all()
    total = int(session.scalar(select(func.count()).select_from(Submission).where(*filters)) or 0)
    return page(list(items), total, page_number, page_size)


@router.put("/submissions/{item_id}/status")
def update_submission(item_id: int, payload: SubmissionStatusInput, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    item = session.get(Submission, item_id)
    if not item: raise HTTPException(404, "投稿不存在")
    before = {"status": item.status}; item.status = payload.status
    return _commit(session, AdminRepository(session), _actor(admin), "submission.status", "submission", item, before)


@router.put("/leads/{item_id}")
def update_lead(item_id: int, payload: LeadUpdate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    from app.models.entities import Lead
    item = session.get(Lead, item_id)
    if not item: raise HTTPException(404, "线索不存在")
    before = {"title": item.title, "status": item.status}
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(item, key, value)
    return _commit(session, AdminRepository(session), _actor(admin), "lead.update", "lead", item, before)


@router.get("/operations/{kind}")
def list_operations(kind: str, page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    models = {"generations": GenerationRun, "tasks": SyncRun, "audits": AuditLog}
    model = models.get(kind)
    if not model: raise HTTPException(404, "记录类型不存在")
    order = model.created_at.desc(); items = session.scalars(select(model).order_by(order).offset((page_number - 1) * page_size).limit(page_size)).all()
    total = int(session.scalar(select(func.count()).select_from(model)) or 0)
    return page(list(items), total, page_number, page_size)
