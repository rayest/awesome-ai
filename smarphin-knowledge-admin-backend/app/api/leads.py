from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.core.security import current_admin
from app.models.entities import AdminAccount
from app.repositories.admin import AdminRepository
from app.schemas.admin import LeadCreate
from app.services.lead_service import LeadService

router = APIRouter(prefix="/api/admin/leads", tags=["leads"])


@router.get("")
def list_leads(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), status: str | None = None, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    items, total = AdminRepository(session).list_leads(page_number, page_size, status)
    data = [{"id": item.id, "title": item.title, "url": item.url, "status": item.status, "failure_reason": item.failure_reason, "created_at": item.created_at} for item in items]
    return page(data, total, page_number, page_size)


@router.post("", status_code=201)
def create_lead(payload: LeadCreate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(LeadService(session, AdminRepository(session)).create_and_fetch(str(payload.url), admin.id))
