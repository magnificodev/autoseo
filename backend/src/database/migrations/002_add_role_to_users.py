"""Add role_id to users table

Revision ID: 002_add_role_to_users
Revises: 001_create_roles
Create Date: 2024-01-01 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_role_to_users'
down_revision = '001_create_roles'
branch_labels = None
depends_on = None


def upgrade():
    # Add role_id column to users table
    op.add_column('users', sa.Column('role_id', sa.Integer(), nullable=True))
    
    # Create foreign key constraint
    op.create_foreign_key('fk_users_role_id', 'users', 'roles', ['role_id'], ['id'])
    
    # Set default role for existing users (viewer role has id=3)
    op.execute("UPDATE users SET role_id = 3 WHERE role_id IS NULL")
    
    # Make role_id NOT NULL after setting defaults
    op.alter_column('users', 'role_id', nullable=False)


def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_users_role_id', 'users', type_='foreignkey')
    
    # Drop role_id column
    op.drop_column('users', 'role_id')
