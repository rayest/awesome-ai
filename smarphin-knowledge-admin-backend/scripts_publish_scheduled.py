import logging

from app.core.database import SessionLocal
from app.services.scheduled_publish import publish_due_articles

logging.basicConfig(level=logging.INFO)

with SessionLocal() as session:
    count = publish_due_articles(session)
    print(f"定时发布检查完成，发布 {count} 篇")
