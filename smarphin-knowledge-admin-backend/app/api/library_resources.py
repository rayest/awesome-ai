from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import page, success
from app.core.security import current_admin
from app.models.entities import AdminAccount
from app.repositories.admin import AdminRepository
from app.schemas.admin import ResourceCreate, ResourceOut, ResourceUpdate
from app.services.resource_workflow import ResourceWorkflow

router = APIRouter(prefix="/api/admin/library-resources", tags=["library-resources"])


@router.get("")
def list_resources(page_number: int = Query(1, alias="page", ge=1), page_size: int = Query(20, ge=1, le=100), status: str | None = None, session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    items, total = AdminRepository(session).list_resources(page_number, page_size, status)
    return page([ResourceOut.model_validate(item).model_dump() for item in items], total, page_number, page_size)


@router.post("", status_code=201)
def create_resource(payload: ResourceCreate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ResourceWorkflow(AdminRepository(session)).create(payload, admin.id))


@router.put("/{resource_id}")
def update_resource(resource_id: int, payload: ResourceUpdate, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ResourceWorkflow(AdminRepository(session)).update(resource_id, payload, admin.id))


@router.post("/{resource_id}/{target_status}")
def transition_resource(resource_id: int, target_status: str, session: Session = Depends(get_db), admin: AdminAccount = Depends(current_admin)):
    return success(ResourceWorkflow(AdminRepository(session)).transition(resource_id, target_status, admin.id))
