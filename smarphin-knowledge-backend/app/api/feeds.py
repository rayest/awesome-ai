from html import escape

from fastapi import APIRouter, Depends, Response

from app.api.public import get_service
from app.core.config import get_settings
from app.services.public_content import PublicContentService

router = APIRouter(prefix="/api/public", tags=["feeds"])


@router.get("/rss")
def article_rss(service: PublicContentService = Depends(get_service)):
    settings = get_settings()
    articles, _ = service.articles(1, 50)
    items = "".join(
        f"<item><title>{escape(item['title'])}</title><link>{settings.public_site_url}/articles/{item['slug']}</link><description>{escape(item['summary'])}</description></item>"
        for item in articles
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>知序 AI 知识社区</title><link>{settings.public_site_url}</link>{items}</channel></rss>'
    return Response(xml, media_type="application/rss+xml; charset=utf-8")


@router.get("/podcast-rss")
def podcast_rss(service: PublicContentService = Depends(get_service)):
    settings = get_settings()
    items = "".join(
        f"<item><title>{escape(item['title'])}</title><link>{settings.public_site_url}/podcasts/{item['slug']}</link><enclosure url=\"{escape(item['audio_url'])}\" type=\"audio/mpeg\" /></item>"
        for item in service.podcasts()
    )
    xml = f'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>知序播客</title><link>{settings.public_site_url}/podcasts</link>{items}</channel></rss>'
    return Response(xml, media_type="application/rss+xml; charset=utf-8")
