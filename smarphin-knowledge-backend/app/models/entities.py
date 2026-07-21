from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


topic_articles = Table(
    "knowledge_topic_articles",
    Base.metadata,
    Column("topic_id", ForeignKey("knowledge_topics.id"), primary_key=True),
    Column("article_id", ForeignKey("knowledge_articles.id"), primary_key=True),
    Column("position", Integer, default=0),
)


class Category(Base, TimestampMixin):
    __tablename__ = "knowledge_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")


class Article(Base, TimestampMixin):
    __tablename__ = "knowledge_articles"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300), index=True)
    summary: Mapped[str] = mapped_column(Text, default="")
    content_markdown: Mapped[str] = mapped_column(Text, default="")
    content_text: Mapped[str] = mapped_column(Text, default="")
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("knowledge_categories.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft", index=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=5)
    source_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class LibraryResource(Base, TimestampMixin):
    __tablename__ = "knowledge_resources"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300), index=True)
    summary: Mapped[str] = mapped_column(Text, default="")
    resource_type: Mapped[str] = mapped_column(String(64), index=True)
    platform: Mapped[str] = mapped_column(String(160), default="通用", index=True)
    difficulty: Mapped[str] = mapped_column(String(32), default="入门")
    file_format: Mapped[str] = mapped_column(String(32), default="Markdown")
    content: Mapped[str] = mapped_column(Text, default="")
    instructions: Mapped[str] = mapped_column(Text, default="")
    variables: Mapped[str] = mapped_column(Text, default="")
    version: Mapped[str] = mapped_column(String(40), default="1.0.0")
    requires_api_key: Mapped[bool] = mapped_column(Boolean, default=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(32), default="draft", index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class CatalogProfile(Base, TimestampMixin):
    __tablename__ = "knowledge_catalog_profiles"
    id: Mapped[int] = mapped_column(primary_key=True); slug: Mapped[str] = mapped_column(String(220), unique=True, index=True); name: Mapped[str] = mapped_column(String(240), index=True); profile_type: Mapped[str] = mapped_column(String(32), index=True)
    provider: Mapped[str] = mapped_column(String(160), default=""); summary: Mapped[str] = mapped_column(Text, default=""); pricing: Mapped[str] = mapped_column(String(240), default="未标注"); availability: Mapped[str] = mapped_column(String(240), default="未标注"); context_window: Mapped[str] = mapped_column(String(120), default="未标注")
    capabilities: Mapped[str] = mapped_column(Text, default=""); best_for: Mapped[str] = mapped_column(Text, default=""); limitations: Mapped[str] = mapped_column(Text, default=""); latest_change: Mapped[str] = mapped_column(Text, default=""); website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    api_available: Mapped[bool] = mapped_column(Boolean, default=False); open_source: Mapped[bool] = mapped_column(Boolean, default=False); status: Mapped[str] = mapped_column(String(32), default="draft", index=True); published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True); verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True); is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Topic(Base, TimestampMixin):
    __tablename__ = "knowledge_topics"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240))
    summary: Mapped[str] = mapped_column(Text, default="")
    audience: Mapped[str] = mapped_column(Text, default="")
    goals: Mapped[str] = mapped_column(Text, default="")
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="draft", index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Podcast(Base, TimestampMixin):
    __tablename__ = "knowledge_podcasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(260))
    summary: Mapped[str] = mapped_column(Text, default="")
    show_notes: Mapped[str] = mapped_column(Text, default="")
    chapters: Mapped[list] = mapped_column(JSON, default=list)
    cover_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    audio_url: Mapped[str] = mapped_column(String(500))
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="draft", index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Submission(Base, TimestampMixin):
    __tablename__ = "knowledge_submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_url: Mapped[str] = mapped_column(String(500), index=True)
    suggested_title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    reason: Mapped[str] = mapped_column(Text)
    contact: Mapped[str | None] = mapped_column(String(180), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="new", index=True)
    requester_ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
