"""Create roles table and default roles

Revision ID: 001_create_roles
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_create_roles'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('max_users', sa.Integer(), nullable=True),
        sa.Column('permissions', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    
    # Create index on name
    op.create_index('ix_roles_name', 'roles', ['name'], unique=True)
    
    # Insert default roles
    op.execute("""
        INSERT INTO roles (name, max_users, permissions, created_at) VALUES
        ('admin', 1, '["*"]', NOW()),
        ('manager', 5, '["dashboard.view", "sites.*", "keywords.*", "content.*", "audit_logs.view"]', NOW()),
        ('viewer', -1, '["dashboard.view", "audit_logs.view"]', NOW())
    """)


def downgrade():
    # Drop roles table
    op.drop_index('ix_roles_name', table_name='roles')
    op.drop_table('roles')
