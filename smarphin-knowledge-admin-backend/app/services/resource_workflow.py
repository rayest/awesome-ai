import logging
from datetime import datetime

from fastapi import HTTPException

from app.models.entities import LibraryResource
from app.repositories.admin import AdminRepository
from app.schemas.admin import ResourceCreate, ResourceOut, ResourceUpdate

logger = logging.getLogger(__name__)


class ResourceWorkflow:
    transitions = {
        "draft": {"reviewing", "archived"},
        "reviewing": {"draft", "published", "archived"},
        "published": {"draft", "archived"},
        "archived": {"draft"},
    }

    def __init__(self, repository: AdminRepository):
        self.repository = repository

    def create(self, payload: ResourceCreate, actor_id: int) -> dict:
        item = self.repository.save_resource(LibraryResource(**payload.model_dump(), created_by=actor_id, updated_by=actor_id))
        self.repository.audit(actor_id, "resource.create", "resource", item.id, None, {"title": item.title, "status": item.status})
        self.repository.commit()
        logger.info("资源草稿已创建，resource_id=%s actor_id=%s", item.id, actor_id)
        return ResourceOut.model_validate(item).model_dump()

    def update(self, resource_id: int, payload: ResourceUpdate, actor_id: int) -> dict:
        item = self._get(resource_id)
        before = {"title": item.title, "status": item.status, "version": item.version}
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        item.updated_by = actor_id
        self.repository.audit(actor_id, "resource.update", "resource", item.id, before, {"title": item.title, "status": item.status, "version": item.version})
        self.repository.commit()
        return ResourceOut.model_validate(item).model_dump()

    def transition(self, resource_id: int, target: str, actor_id: int) -> dict:
        item = self._get(resource_id)
        if target not in self.transitions.get(item.status, set()):
            raise HTTPException(status_code=409, detail=f"不能从 {item.status} 变更为 {target}")
        before = {"status": item.status}
        item.status = target
        if target == "published":
            item.published_at = datetime.utcnow()
        item.updated_by = actor_id
        self.repository.audit(actor_id, f"resource.{target}", "resource", item.id, before, {"status": target})
        self.repository.commit()
        logger.info("资源状态已变更，resource_id=%s target=%s actor_id=%s", item.id, target, actor_id)
        return ResourceOut.model_validate(item).model_dump()

    def _get(self, resource_id: int) -> LibraryResource:
        item = self.repository.get_resource(resource_id)
        if not item or item.is_deleted:
            raise HTTPException(status_code=404, detail="资源不存在")
        return item
