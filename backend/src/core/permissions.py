from typing import List
from src.database.models import User

# Permission definitions
PERMISSIONS = {
    "dashboard.view": "View dashboard",
    "dashboard.manage": "Manage dashboard settings",
    "sites.view": "View sites",
    "sites.create": "Create sites",
    "sites.update": "Update sites",
    "sites.delete": "Delete sites",
    "keywords.view": "View keywords",
    "keywords.create": "Create keywords",
    "keywords.update": "Update keywords",
    "keywords.delete": "Delete keywords",
    "content.view": "View content queue",
    "content.approve": "Approve content",
    "content.reject": "Reject content",
    "content.publish": "Publish content",
    "admins.view": "View admins",
    "admins.manage": "Manage admins",
    "audit_logs.view": "View audit logs",
    "users.view": "View users",
    "users.manage": "Manage users"
}

# Role permissions mapping
ROLE_PERMISSIONS = {
    "admin": ["*"],  # All permissions
    "manager": [
        "dashboard.view",
        "sites.view", "sites.create", "sites.update", "sites.delete",
        "keywords.view", "keywords.create", "keywords.update", "keywords.delete",
        "content.view", "content.approve", "content.reject", "content.publish",
        "audit_logs.view"
    ],
    "viewer": [
        "dashboard.view",
        "audit_logs.view"
    ]
}


def check_permission(user: User, permission: str) -> bool:
    """
    Check if user has specific permission
    """
    if not user or not user.role:
        return False
    
    role_permissions = ROLE_PERMISSIONS.get(user.role.name, [])
    
    # Admin has all permissions
    if "*" in role_permissions:
        return True
    
    # Check specific permission
    return permission in role_permissions


def get_user_permissions(user: User) -> List[str]:
    """
    Get all permissions for a user
    """
    if not user or not user.role:
        return []
    
    role_permissions = ROLE_PERMISSIONS.get(user.role.name, [])
    
    if "*" in role_permissions:
        return list(PERMISSIONS.keys())
    
    return role_permissions


def can_manage_user(manager: User, target: User) -> bool:
    """
    Check if manager can manage target user
    """
    if not manager or not target or not manager.role or not target.role:
        return False
    
    # Role hierarchy: admin > manager > viewer
    role_hierarchy = {
        "admin": 3,
        "manager": 2,
        "viewer": 1
    }
    
    manager_level = role_hierarchy.get(manager.role.name, 0)
    target_level = role_hierarchy.get(target.role.name, 0)
    
    return manager_level > target_level
