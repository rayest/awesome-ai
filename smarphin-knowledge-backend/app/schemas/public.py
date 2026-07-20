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
    category_slug: str | None = None
    category_name: str | None = None

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


class TopicDetailOut(TopicOut):
    articles: list[ArticleOut] = Field(default_factory=list)


class PodcastOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    show_notes: str | None = None
    chapters: list = Field(default_factory=list)
    cover_url: str | None = None
    audio_url: str
    duration_seconds: int
    published_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class ResourceOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    resource_type: str
    platform: str
    difficulty: str
    file_format: str
    content: str | None = None
    instructions: str | None = None
    variables: str | None = None
    version: str
    requires_api_key: bool
    featured: bool
    published_at: datetime | None
    verified_at: datetime | None
    model_config = ConfigDict(from_attributes=True)

class CatalogProfileOut(BaseModel):
    id:int; slug:str; name:str; profile_type:str; provider:str; summary:str; pricing:str; availability:str; context_window:str; capabilities:str; best_for:str; limitations:str; latest_change:str; website_url:str|None=None; api_available:bool; open_source:bool; published_at:datetime|None; verified_at:datetime|None
    model_config=ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    source_url: AnyHttpUrl
    reason: str = Field(min_length=10, max_length=2000)
    suggested_title: str | None = Field(default=None, max_length=300)
    contact: str | None = Field(default=None, max_length=180)
    website: str | None = Field(default=None, max_length=0, description="蜜罐字段，必须为空")
