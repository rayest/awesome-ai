"""add topic cover_url

Revision ID: 20260720_0004
Revises: 20260719_0003
Create Date: 2026-07-20 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260720_0004"
down_revision = "20260719_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("knowledge_topics", sa.Column("cover_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("knowledge_topics", "cover_url")