"""init schema

Revision ID: 0001
Revises: 
Create Date: 2025-10-15

"""
from alembic import op
import sqlalchemy as sa


revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table(
        'sites',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('wp_url', sa.String(length=500), nullable=False),
        sa.Column('wp_username', sa.String(length=255), nullable=False),
        sa.Column('wp_password_enc', sa.String(length=500), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'keywords',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('site_id', sa.Integer(), sa.ForeignKey('sites.id', ondelete='CASCADE'), nullable=False),
        sa.Column('keyword', sa.String(length=255), nullable=False),
        sa.Column('language', sa.String(length=16), server_default='vi'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_keywords_keyword', 'keywords', ['keyword'])

    op.create_table(
        'content_queue',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('site_id', sa.Integer(), sa.ForeignKey('sites.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('body', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('content_queue')
    op.drop_index('ix_keywords_keyword', table_name='keywords')
    op.drop_table('keywords')
    op.drop_table('sites')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')


