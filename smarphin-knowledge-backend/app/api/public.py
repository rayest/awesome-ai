from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.repositories.content import ContentRepository
from app.schemas.public import SubmissionCreate
from app.services.public_content import PublicContentService
from app.models.entities import Category
from sqlalchemy import select

router = APIRouter(prefix="/api/public", tags=["public"])


def get_service(session: Session = Depends(get_db)) -> PublicContentService:
    return PublicContentService(ContentRepository(session))


@router.get("/home")
def home(service: PublicContentService = Depends(get_service)):
    featured, _ = service.articles(1, 1, featured=True)
    latest, _ = service.articles(1, 6)
    return success({"featured": featured[0] if featured else None, "latest": latest, "topics": service.topics()[:4], "podcasts": service.podcasts()[:1]})


@router.get("/articles")
def articles(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), query: str | None = None, service: PublicContentService = Depends(get_service)):
    items, total = service.articles(page_number, page_size, query)
    return page(items, total, page_number, page_size)


@router.get("/articles/{slug}")
def article(slug: str, service: PublicContentService = Depends(get_service)):
    return success(service.article(slug))


@router.get("/search")
def search(q: str = Query(min_length=1, max_length=120), page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), service: PublicContentService = Depends(get_service)):
    items, total = service.articles(page_number, page_size, q)
    return page(items, total, page_number, page_size)


@router.get("/topics")
def topics(service: PublicContentService = Depends(get_service)):
    return success(service.topics())


@router.get("/categories")
def categories(session: Session = Depends(get_db)):
    items = session.scalars(select(Category).order_by(Category.name)).all()
    return success([{"id": item.id, "slug": item.slug, "name": item.name, "description": item.description} for item in items])


@router.get("/topics/{slug}")
def topic(slug: str, service: PublicContentService = Depends(get_service)):
    return success(service.topic(slug))


@router.get("/podcasts")
def podcasts(service: PublicContentService = Depends(get_service)):
    return success(service.podcasts())


@router.get("/podcasts/{slug}")
def podcast(slug: str, service: PublicContentService = Depends(get_service)):
    return success(service.podcast(slug))


@router.post("/submissions", status_code=201)
def submit(payload: SubmissionCreate, request: Request, service: PublicContentService = Depends(get_service)):
    requester_ip = request.client.host if request.client else "unknown"
    return success(service.submit(payload, requester_ip))
