'use client';

import { usePermissions } from '../../src/hooks/usePermissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
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
    <nav className="space-y-2">
      {navItems.map((item) => {
        if (!item.show) return null;
        
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center space-x-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              "hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md border border-primary/20" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              isActive 
                ? "bg-primary-foreground/20" 
                : "group-hover:bg-accent/50"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="flex-1">{item.label}</span>
            {isActive && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
