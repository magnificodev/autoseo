"""site auto config

Revision ID: 0002
Revises: 0001
Create Date: 2025-10-15

"""
from alembic import op
import sqlalchemy as sa


revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('sites', sa.Column('is_auto_enabled', sa.Boolean(), server_default=sa.text('false')))
    op.add_column('sites', sa.Column('schedule_cron', sa.String(length=64), server_default='0 * * * *'))
    op.add_column('sites', sa.Column('daily_quota', sa.Integer(), server_default='5'))
    op.add_column('sites', sa.Column('active_start_hour', sa.Integer(), server_default='8'))
    op.add_column('sites', sa.Column('active_end_hour', sa.Integer(), server_default='22'))


def downgrade() -> None:
    op.drop_column('sites', 'active_end_hour')
    op.drop_column('sites', 'active_start_hour')
    op.drop_column('sites', 'daily_quota')
    op.drop_column('sites', 'schedule_cron')
    op.drop_column('sites', 'is_auto_enabled')


