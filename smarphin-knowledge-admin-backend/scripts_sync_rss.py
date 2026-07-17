import logging

from app.core.database import SessionLocal
from app.services.rss_sync import sync_all_sources

logging.basicConfig(level=logging.INFO)

with SessionLocal() as session:
    runs = sync_all_sources(session)
    print(f"RSS 同步完成，共处理 {len(runs)} 个来源")
