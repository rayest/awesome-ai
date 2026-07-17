import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.responses import success
from app.core.security import current_admin
from app.models.entities import AdminAccount
from app.providers.storage import StorageProvider

router = APIRouter(prefix="/api/admin/uploads", tags=["uploads"])
logger = logging.getLogger(__name__)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/mp4", "audio/x-m4a"}


@router.post("")
async def upload(file: UploadFile = File(...), admin: AdminAccount = Depends(current_admin)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="不支持该文件类型")
    content = await file.read(50 * 1024 * 1024 + 1)
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="文件超过 50MB")
    suffix = Path(file.filename or "upload").suffix.lower()
    filename = f"{uuid.uuid4().hex}{suffix}"
    url = StorageProvider().put(filename, content, file.content_type or "application/octet-stream")
    logger.info("媒体文件上传完成，filename=%s actor_id=%s", filename, admin.id)
    return success({"url": url, "filename": filename, "size": len(content), "content_type": file.content_type})
