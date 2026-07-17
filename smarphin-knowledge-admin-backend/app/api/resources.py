from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import AnyHttpUrl, BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.core.security import current_admin
from app.models.entities import AdminAccount, AuditLog, Category, GenerationRun, Podcast, Source, Submission, SyncRun, Tag, Topic

router = APIRouter(prefix="/api/admin", tags=["resources"])


class SourceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    url: AnyHttpUrl
    rss_url: AnyHttpUrl | None = None


class TopicCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=240)
    summary: str = ""
    audience: str = ""
    goals: str = ""


class PodcastCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=260)
    summary: str = ""
    show_notes: str = ""
    audio_url: str
    cover_url: str | None = None
    duration_seconds: int = Field(default=0, ge=0)


def model_page(session: Session, model, page_number: int, page_size: int, order_column):
    items = session.scalars(select(model).order_by(order_column.desc()).offset((page_number - 1) * page_size).limit(page_size)).all()
    total = int(session.scalar(select(func.count()).select_from(model)) or 0)
    return page(items, total, page_number, page_size)


@router.get("/sources")
def sources(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, Source, page_number, page_size, Source.updated_at)


@router.post("/sources", status_code=201)
def create_source(payload: SourceCreate, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    item = Source(name=payload.name, url=str(payload.url), rss_url=str(payload.rss_url) if payload.rss_url else None)
    session.add(item); session.commit(); session.refresh(item)
    return success(item)


@router.get("/topics")
def topics(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, Topic, page_number, page_size, Topic.updated_at)


@router.post("/topics", status_code=201)
def create_topic(payload: TopicCreate, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    item = Topic(**payload.model_dump()); session.add(item); session.commit(); session.refresh(item)
    return success(item)


@router.get("/podcasts")
def podcasts(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, Podcast, page_number, page_size, Podcast.updated_at)


@router.post("/podcasts", status_code=201)
def create_podcast(payload: PodcastCreate, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    item = Podcast(**payload.model_dump()); session.add(item); session.commit(); session.refresh(item)
    return success(item)


@router.get("/submissions")
def submissions(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, Submission, page_number, page_size, Submission.created_at)


@router.get("/generation-runs")
def generation_runs(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, GenerationRun, page_number, page_size, GenerationRun.created_at)


@router.get("/sync-runs")
def sync_runs(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, SyncRun, page_number, page_size, SyncRun.created_at)


@router.get("/audit-logs")
def audit_logs(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return model_page(session, AuditLog, page_number, page_size, AuditLog.created_at)


@router.get("/categories")
def categories(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return success(list(session.scalars(select(Category).order_by(Category.name)).all()))


@router.get("/tags")
def tags(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    return success(list(session.scalars(select(Tag).order_by(Tag.name)).all()))
