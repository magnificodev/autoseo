'use client';

import { usePermissions } from '@/src/hooks/usePermissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const { canManageAdmins, canManageSites, canManageContent, canViewAuditLogs, canManageUsers } = usePermissions();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/sites',
      label: 'Sites',
      show: canManageSites,
    },
    {
      href: '/keywords',
      label: 'Keywords',
      show: canManageSites,
    },
    {
      href: '/content-queue',
      label: 'Content Queue',
      show: canManageContent,
    },
    {
      href: '/users',
      label: 'Users',
      show: canManageUsers,
    },
    {
      href: '/admins',
      label: 'Admins',
      show: canManageAdmins,
    },
    {
      href: '/audit-logs',
      label: 'Audit Logs',
      show: canViewAuditLogs,
    },
  ];

  return (
    <nav className="space-y-2 text-sm">
      {navItems.map((item) => {
        if (!item.show) return null;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded px-2 py-1 hover:bg-gray-100 transition-colors",
              pathname === item.href && "bg-gray-100 font-medium"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
