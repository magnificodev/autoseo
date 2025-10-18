"""add role_id to users

Revision ID: 0005
Revises: 0004
Create Date: 2025-10-18

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add role_id column to users table
    op.add_column('users', sa.Column('role_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key('fk_users_role_id', 'users', 'roles', ['role_id'], ['id'])
    
    # Set default role_id to 3 (viewer) for existing users
    op.execute("UPDATE users SET role_id = 3 WHERE role_id IS NULL")


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint('fk_users_role_id', 'users', type_='foreignkey')
    
    # Drop role_id column
    op.drop_column('users', 'role_id')
