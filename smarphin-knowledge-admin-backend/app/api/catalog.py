from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.responses import success
from app.core.security import current_admin
from app.models.entities import AdminAccount
from app.repositories.admin import AdminRepository
from app.schemas.admin import CatalogProfileCreate, CatalogProfileOut, CatalogProfileUpdate
from app.services.catalog_workflow import CatalogWorkflow
router=APIRouter(prefix="/api/admin/catalog", tags=["catalog"])
@router.get("")
def profiles(profile_type: str | None=None, session: Session=Depends(get_db), _: AdminAccount=Depends(current_admin)): return success([CatalogProfileOut.model_validate(x).model_dump() for x in AdminRepository(session).list_profiles(profile_type)])
@router.post("", status_code=201)
def create(payload: CatalogProfileCreate, session: Session=Depends(get_db), admin: AdminAccount=Depends(current_admin)): return success(CatalogWorkflow(AdminRepository(session)).create(payload, admin.id))
@router.put("/{profile_id}")
def update(profile_id: int, payload: CatalogProfileUpdate, session: Session=Depends(get_db), admin: AdminAccount=Depends(current_admin)): return success(CatalogWorkflow(AdminRepository(session)).update(profile_id, payload, admin.id))
@router.post("/{profile_id}/{target}")
def transition(profile_id: int, target: str, session: Session=Depends(get_db), admin: AdminAccount=Depends(current_admin)): return success(CatalogWorkflow(AdminRepository(session)).transition(profile_id, target, admin.id))
