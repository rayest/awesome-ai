from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


article_tags = Table(
    "knowledge_article_tags",
    Base.metadata,
    Column("article_id", ForeignKey("knowledge_articles.id"), primary_key=True),
    Column("tag_id", ForeignKey("knowledge_tags.id"), primary_key=True),
)

topic_articles = Table(
    "knowledge_topic_articles",
    Base.metadata,
    Column("topic_id", ForeignKey("knowledge_topics.id"), primary_key=True),
    Column("article_id", ForeignKey("knowledge_articles.id"), primary_key=True),
    Column("position", Integer, default=0),
)


class AdminAccount(Base, TimestampMixin):
    __tablename__ = "admin_accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Category(Base, TimestampMixin):
    __tablename__ = "knowledge_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")


class Tag(Base, TimestampMixin):
    __tablename__ = "knowledge_tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))


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
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=5)
    source_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("admin_accounts.id"), nullable=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("admin_accounts.id"), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


class Source(Base, TimestampMixin):
    __tablename__ = "knowledge_sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(180))
    source_type: Mapped[str] = mapped_column(String(32), default="website")
    url: Mapped[str] = mapped_column(String(500), unique=True)
    rss_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Lead(Base, TimestampMixin):
    __tablename__ = "knowledge_leads"
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("knowledge_sources.id"), nullable=True)
    url: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300), default="")
    excerpt: Mapped[str] = mapped_column(Text, default="")
    raw_content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="new", index=True)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    converted_article_id: Mapped[int | None] = mapped_column(ForeignKey("knowledge_articles.id"), nullable=True)


class Topic(Base, TimestampMixin):
    __tablename__ = "knowledge_topics"
    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(240))
    summary: Mapped[str] = mapped_column(Text, default="")
    audience: Mapped[str] = mapped_column(Text, default="")
    goals: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="draft", index=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class ArticleSource(Base, TimestampMixin):
    __tablename__ = "knowledge_article_sources"
    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int] = mapped_column(ForeignKey("knowledge_articles.id"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    site_name: Mapped[str | None] = mapped_column(String(180), nullable=True)
    author: Mapped[str | None] = mapped_column(String(180), nullable=True)
    original_published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)


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


class GenerationRun(Base, TimestampMixin):
    __tablename__ = "knowledge_generation_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    article_id: Mapped[int | None] = mapped_column(ForeignKey("knowledge_articles.id"), nullable=True)
    model: Mapped[str] = mapped_column(String(120))
    prompt_version: Mapped[str] = mapped_column(String(80), default="v1")
    input_summary: Mapped[str] = mapped_column(Text, default="")
    output_text: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="running", index=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("admin_accounts.id"), nullable=True)


class SyncRun(Base, TimestampMixin):
    __tablename__ = "knowledge_sync_runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("knowledge_sources.id"), nullable=True)
    run_type: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default="running", index=True)
    discovered_count: Mapped[int] = mapped_column(Integer, default=0)
    created_count: Mapped[int] = mapped_column(Integer, default=0)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)


class AuditLog(Base):
    __tablename__ = "knowledge_audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("admin_accounts.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(80), index=True)
    target_type: Mapped[str] = mapped_column(String(80), index=True)
    target_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    before_state: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    after_state: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
