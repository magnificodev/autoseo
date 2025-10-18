'use client';

import { usePermissions } from '@/src/hooks/usePermissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Globe, 
  Search, 
  FileText, 
  Users, 
  Shield, 
  Activity,
  Home,
  UserPlus
} from 'lucide-react';

export default function Navigation() {
  const { canManageAdmins, canManageSites, canManageContent, canViewAuditLogs, canManageUsers } = usePermissions();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
      show: true,
    },
    {
      href: '/sites',
      label: 'Sites',
      icon: Globe,
      show: canManageSites,
    },
    {
      href: '/keywords',
      label: 'Keywords',
      icon: Search,
      show: canManageSites,
    },
    {
      href: '/content-queue',
      label: 'Content Queue',
      icon: FileText,
      show: canManageContent,
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
      show: canManageUsers,
    },
    {
      href: '/role-applications',
      label: 'Role Applications',
      icon: UserPlus,
      show: canManageUsers,
    },
    {
      href: '/admins',
      label: 'Admins',
      icon: Shield,
      show: canManageAdmins,
    },
    {
      href: '/audit-logs',
      label: 'Audit Logs',
      icon: Activity,
      show: canViewAuditLogs,
    },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        if (!item.show) return null;
        
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
