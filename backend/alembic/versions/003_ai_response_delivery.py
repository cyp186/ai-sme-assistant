"""Add delivery timestamp to AI responses

Revision ID: 003_ai_response_delivery
Revises: 002_email_verification
Create Date: 2026-08-17

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003_ai_response_delivery"
down_revision: Union[str, Sequence[str], None] = "002_email_verification"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_responses",
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("ai_responses", "sent_at")
