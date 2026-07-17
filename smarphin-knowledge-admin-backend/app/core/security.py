from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.entities import AdminAccount

password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)


def create_token(subject: str, token_type: str = "access") -> str:
    settings = get_settings()
    delta = timedelta(minutes=settings.access_token_minutes) if token_type == "access" else timedelta(days=settings.refresh_token_days)
    payload = {"sub": subject, "type": token_type, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def current_admin(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), session: Session = Depends(get_db)) -> AdminAccount:
    if not credentials:
        raise HTTPException(status_code=401, detail="请先登录")
    try:
        payload = jwt.decode(credentials.credentials, get_settings().jwt_secret, algorithms=["HS256"])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail="登录状态已失效") from exc
    account = session.scalar(select(AdminAccount).where(AdminAccount.id == int(payload["sub"]), AdminAccount.is_active.is_(True)))
    if not account:
        raise HTTPException(status_code=401, detail="管理员不存在或已停用")
    return account
