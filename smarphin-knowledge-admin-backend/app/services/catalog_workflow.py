import logging
from datetime import datetime
from fastapi import HTTPException
from app.models.entities import CatalogProfile
from app.repositories.admin import AdminRepository
from app.schemas.admin import CatalogProfileCreate, CatalogProfileOut, CatalogProfileUpdate

logger = logging.getLogger(__name__)

class CatalogWorkflow:
    transitions = {"draft": {"reviewing", "archived"}, "reviewing": {"draft", "published", "archived"}, "published": {"draft", "archived"}, "archived": {"draft"}}
    def __init__(self, repository: AdminRepository): self.repository = repository
    def create(self, payload: CatalogProfileCreate, actor_id: int):
        item = self.repository.save_profile(CatalogProfile(**payload.model_dump(), created_by=actor_id, updated_by=actor_id)); self.repository.audit(actor_id, "catalog.create", "catalog_profile", item.id, None, {"name": item.name}); self.repository.commit(); logger.info("模型工具档案已创建，profile_id=%s", item.id); return CatalogProfileOut.model_validate(item).model_dump()
    def update(self, profile_id: int, payload: CatalogProfileUpdate, actor_id: int):
        item = self._get(profile_id); before={"name": item.name, "status": item.status}; [setattr(item, k, v) for k, v in payload.model_dump(exclude_unset=True).items()]; item.updated_by=actor_id; self.repository.audit(actor_id, "catalog.update", "catalog_profile", item.id, before, {"name": item.name, "status": item.status}); self.repository.commit(); return CatalogProfileOut.model_validate(item).model_dump()
    def transition(self, profile_id: int, target: str, actor_id: int):
        item=self._get(profile_id)
        if target not in self.transitions.get(item.status, set()): raise HTTPException(status_code=409, detail="不允许的状态变更")
        before={"status": item.status}; item.status=target; item.published_at=datetime.utcnow() if target == "published" else item.published_at; item.updated_by=actor_id; self.repository.audit(actor_id, f"catalog.{target}", "catalog_profile", item.id, before, {"status": target}); self.repository.commit(); logger.info("模型工具档案状态已变更，profile_id=%s target=%s", item.id, target); return CatalogProfileOut.model_validate(item).model_dump()
    def _get(self, profile_id: int):
        item=self.repository.get_profile(profile_id)
        if not item or item.is_deleted: raise HTTPException(status_code=404, detail="档案不存在")
        return item
