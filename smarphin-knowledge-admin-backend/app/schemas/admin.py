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


class LeadCreate(BaseModel):
    url: AnyHttpUrl
    title: str = Field(default="", max_length=300)


class GenerateRequest(BaseModel):
    source_text: str = Field(min_length=20, max_length=100000)
    prompt_version: str = Field(default="v1", max_length=80)
