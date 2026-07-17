from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.core.database import get_db
from app.core.responses import success
from app.core.security import current_admin
from app.models.entities import AdminAccount, Article, Lead, Podcast, Submission

router = APIRouter(prefix="/api/admin", tags=["dashboard"])


@router.get("/dashboard")
def dashboard(session: Session = Depends(get_db), _: AdminAccount = Depends(current_admin)):
    def count(model, *filters):
        return int(session.scalar(select(func.count()).select_from(model).where(*filters)) or 0)
    return success({
        "draft_articles": count(Article, Article.status == "draft", Article.is_deleted.is_(False)),
        "reviewing_articles": count(Article, Article.status == "reviewing", Article.is_deleted.is_(False)),
        "new_leads": count(Lead, Lead.status == "new"),
        "new_submissions": count(Submission, Submission.status == "new"),
        "published_podcasts": count(Podcast, Podcast.status == "published"),
    })
