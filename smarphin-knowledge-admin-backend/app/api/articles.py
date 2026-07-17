from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.core.security import current_admin
from app.models.entities import AdminAccount
from app.repositories.admin import AdminRepository
from app.schemas.admin import ArticleCreate, ArticleOut, ArticleUpdate, GenerateRequest, StatusRequest
from app.services.article_workflow import ArticleWorkflow
from app.services.generation_service import GenerationService

router = APIRouter(prefix="/api/admin/articles", tags=["articles"])


@router.get("")
def list_articles(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), status: str | None = None, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    items, total = AdminRepository(session).list_articles(page_number, page_size, status)
    return page([ArticleOut.model_validate(item).model_dump() for item in items], total, page_number, page_size)


@router.post("", status_code=201)
def create_article(payload: ArticleCreate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ArticleWorkflow(AdminRepository(session)).create(payload, admin.id))


@router.put("/{article_id}")
def update_article(article_id: int, payload: ArticleUpdate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ArticleWorkflow(AdminRepository(session)).update(article_id, payload, admin.id))


@router.post("/{article_id}/{target_status}")
def transition_article(article_id: int, target_status: str, payload: StatusRequest, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ArticleWorkflow(AdminRepository(session)).transition(article_id, target_status, admin.id, payload.scheduled_at))


@router.post("/{article_id}/generate")
def generate_article(article_id: int, payload: GenerateRequest, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(GenerationService(session).generate(article_id, payload.source_text, payload.prompt_version, admin.id))
