"""Add editable resource library."""
from alembic import op
import sqlalchemy as sa

revision = "20260719_0002"
down_revision = "20260717_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if sa.inspect(op.get_bind()).has_table("knowledge_resources"):
        return
    op.create_table(
        "knowledge_resources",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("resource_type", sa.String(64), nullable=False),
        sa.Column("platform", sa.String(160), nullable=False, server_default="通用"),
        sa.Column("difficulty", sa.String(32), nullable=False, server_default="入门"),
        sa.Column("file_format", sa.String(32), nullable=False, server_default="Markdown"),
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
        sa.Column("instructions", sa.Text(), nullable=False, server_default=""),
        sa.Column("variables", sa.Text(), nullable=False, server_default=""),
        sa.Column("version", sa.String(40), nullable=False, server_default="1.0.0"),
        sa.Column("requires_api_key", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.Integer(), sa.ForeignKey("admin_accounts.id"), nullable=True),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("admin_accounts.id"), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_knowledge_resources_slug", "knowledge_resources", ["slug"], unique=True)
    op.create_index("ix_knowledge_resources_status", "knowledge_resources", ["status"])
    op.create_index("ix_knowledge_resources_type", "knowledge_resources", ["resource_type"])


def downgrade() -> None:
    if sa.inspect(op.get_bind()).has_table("knowledge_resources"):
        op.drop_table("knowledge_resources")
