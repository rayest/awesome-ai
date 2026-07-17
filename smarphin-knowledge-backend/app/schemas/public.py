from datetime import datetime

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


class ArticleOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    content_markdown: str | None = None
    cover_url: str | None = None
    reading_minutes: int
    source_name: str | None = None
    source_url: str | None = None
    source_verified: bool
    published_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class TopicOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    audience: str
    goals: str
    published_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class PodcastOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    show_notes: str | None = None
    cover_url: str | None = None
    audio_url: str
    duration_seconds: int
    published_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    source_url: AnyHttpUrl
    reason: str = Field(min_length=10, max_length=2000)
    suggested_title: str | None = Field(default=None, max_length=300)
    contact: str | None = Field(default=None, max_length=180)
    website: str | None = Field(default=None, max_length=0, description="蜜罐字段，必须为空")
