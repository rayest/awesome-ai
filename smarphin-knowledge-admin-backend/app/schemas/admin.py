from datetime import datetime

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ArticleCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=300)
    summary: str = Field(default="", max_length=2000)
    content_markdown: str = ""
    cover_url: str | None = None
    category_id: int | None = None
    featured: bool = False
    source_name: str | None = None
    source_url: str | None = None
    source_verified: bool = False


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=300)
    summary: str | None = Field(default=None, max_length=2000)
    content_markdown: str | None = None
    cover_url: str | None = None
    category_id: int | None = None
    featured: bool | None = None
    source_name: str | None = None
    source_url: str | None = None
    source_verified: bool | None = None


class ArticleOut(BaseModel):
    id: int
    slug: str
    title: str
    summary: str
    content_markdown: str
    cover_url: str | None
    status: str
    featured: bool
    published_at: datetime | None
    scheduled_at: datetime | None
    source_name: str | None
    source_url: str | None
    source_verified: bool
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class StatusRequest(BaseModel):
    scheduled_at: datetime | None = None
    reason: str | None = Field(default=None, max_length=500)


class ResourceCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=300)
    summary: str = Field(default="", max_length=2000)
    resource_type: str = Field(min_length=2, max_length=64)
    platform: str = Field(default="通用", max_length=160)
    difficulty: str = Field(default="入门", max_length=32)
    file_format: str = Field(default="Markdown", max_length=32)
    content: str = ""
    instructions: str = ""
    variables: str = ""
    version: str = Field(default="1.0.0", max_length=40)
    requires_api_key: bool = False
    featured: bool = False
    verified_at: datetime | None = None


class ResourceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=300)
    summary: str | None = Field(default=None, max_length=2000)
    resource_type: str | None = Field(default=None, min_length=2, max_length=64)
    platform: str | None = Field(default=None, max_length=160)
    difficulty: str | None = Field(default=None, max_length=32)
    file_format: str | None = Field(default=None, max_length=32)
    content: str | None = None
    instructions: str | None = None
    variables: str | None = None
    version: str | None = Field(default=None, max_length=40)
    requires_api_key: bool | None = None
    featured: bool | None = None
    verified_at: datetime | None = None


class ResourceOut(ResourceCreate):
    id: int
    status: str
    published_at: datetime | None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CatalogProfileCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: str = Field(min_length=2, max_length=240)
    profile_type: str = Field(pattern=r"^(model|tool)$")
    provider: str = ""
    summary: str = ""
    pricing: str = "未标注"
    availability: str = "未标注"
    context_window: str = "未标注"
    capabilities: str = ""
    best_for: str = ""
    limitations: str = ""
    latest_change: str = ""
    website_url: str | None = None
    api_available: bool = False
    open_source: bool = False
    verified_at: datetime | None = None


class CatalogProfileUpdate(BaseModel):
    name: str | None = None
    provider: str | None = None
    summary: str | None = None
    pricing: str | None = None
    availability: str | None = None
    context_window: str | None = None
    capabilities: str | None = None
    best_for: str | None = None
    limitations: str | None = None
    latest_change: str | None = None
    website_url: str | None = None
    api_available: bool | None = None
    open_source: bool | None = None
    verified_at: datetime | None = None


class CatalogProfileOut(CatalogProfileCreate):
    id: int
    status: str
    published_at: datetime | None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class LeadCreate(BaseModel):
    url: AnyHttpUrl
    title: str = Field(default="", max_length=300)


class GenerateRequest(BaseModel):
    source_text: str = Field(min_length=20, max_length=100000)
    prompt_version: str = Field(default="v1", max_length=80)


class CategoryInput(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: str = Field(min_length=2, max_length=120)
    description: str = ""


class TopicInput(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=240)
    summary: str = ""
    audience: str = ""
    goals: str = ""
    article_ids: list[int] = Field(default_factory=list)


class PodcastInput(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=260)
    summary: str = ""
    show_notes: str = ""
    chapters: list[dict] = Field(default_factory=list)
    cover_url: str | None = None
    audio_url: str = Field(min_length=1, max_length=500)
    duration_seconds: int = Field(default=0, ge=0)


class SourceInput(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    source_type: str = Field(default="website", max_length=32)
    url: AnyHttpUrl
    rss_url: AnyHttpUrl | None = None
    is_active: bool = True


class SubmissionStatusInput(BaseModel):
    status: str = Field(pattern=r"^(new|reviewing|accepted|rejected)$")


class LeadUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=300)
    excerpt: str | None = None
    status: str | None = Field(default=None, pattern=r"^(new|shortlisted|converted|rejected|fetch_failed)$")
