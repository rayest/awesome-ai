from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.responses import success
from app.core.config import get_settings
from app.core.security import create_token, verify_password
import jwt
from pydantic import BaseModel
from app.models.entities import AdminAccount
from app.schemas.admin import LoginRequest

router = APIRouter(prefix="/api/admin/auth", tags=["auth"])


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
def login(payload: LoginRequest, session: Session = Depends(get_db)):
    account = session.scalar(select(AdminAccount).where(AdminAccount.email == payload.email, AdminAccount.is_active.is_(True)))
    if not account or not verify_password(payload.password, account.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    account.last_login_at = datetime.utcnow()
    session.commit()
    return success({"access_token": create_token(str(account.id)), "refresh_token": create_token(str(account.id), "refresh"), "admin": {"id": account.id, "email": account.email, "display_name": account.display_name}})


@router.post("/refresh")
def refresh(payload: RefreshRequest, session: Session = Depends(get_db)):
    try:
        token = jwt.decode(payload.refresh_token, get_settings().jwt_secret, algorithms=["HS256"])
        if token.get("type") != "refresh":
            raise ValueError("invalid token type")
    except (jwt.PyJWTError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="刷新令牌已失效") from exc
    account = session.get(AdminAccount, int(token["sub"]))
    if not account or not account.is_active:
        raise HTTPException(status_code=401, detail="管理员不存在或已停用")
    return success({"access_token": create_token(str(account.id))})
