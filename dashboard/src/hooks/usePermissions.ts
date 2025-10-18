'use client';

import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  
  if (!user || !user.role) {
    return {
      isAdmin: false,
      isManager: false,
      isViewer: false,
      canManageAdmins: false,
      canManageSites: false,
      canManageContent: false,
      canViewAuditLogs: false,
      canManageUsers: false,
      canViewDashboard: false,
    };
  }

  const roleName = user.role.name;
  
  return {
    isAdmin: roleName === 'admin',
    isManager: roleName === 'manager',
    isViewer: roleName === 'viewer',
    
    // Admin permissions
    canManageAdmins: roleName === 'admin',
    canManageUsers: roleName === 'admin',
    
    // Manager and Admin permissions
    canManageSites: ['admin', 'manager'].includes(roleName),
    canManageContent: ['admin', 'manager'].includes(roleName),
    
    // All roles can view
    canViewAuditLogs: ['admin', 'manager', 'viewer'].includes(roleName),
    canViewDashboard: ['admin', 'manager', 'viewer'].includes(roleName),
  };
};
