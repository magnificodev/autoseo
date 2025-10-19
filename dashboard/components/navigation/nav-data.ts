import {
    Activity,
    FileText,
    Globe,
    Home,
    LucideIcon,
    Search,
    Shield,
    UserPlus,
    Users,
    Settings,
} from 'lucide-react';

export interface NavItem {
    key: string;
    label: string;
    href: string;
    icon: LucideIcon;
    roles?: string[];
    group?: string;
}

export const NAV_ITEMS: NavItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: Home,
        group: 'Overview',
    },
    {
        key: 'sites',
        label: 'Sites',
        href: '/sites',
        icon: Globe,
        roles: ['admin', 'manager'],
        group: 'Content',
    },
    {
        key: 'keywords',
        label: 'Keywords',
        href: '/keywords',
        icon: Search,
        roles: ['admin', 'manager'],
        group: 'Content',
    },
    {
        key: 'content-queue',
        label: 'Content Queue',
        href: '/content-queue',
        icon: FileText,
        roles: ['admin', 'manager'],
        group: 'Content',
    },
    {
        key: 'users',
        label: 'Users',
        href: '/users',
        icon: Users,
        roles: ['admin'],
        group: 'Admin',
    },
    {
        key: 'role-applications',
        label: 'Role Applications',
        href: '/role-applications',
        icon: UserPlus,
        roles: ['admin'],
        group: 'Admin',
    },
    {
        key: 'admins',
        label: 'Admins',
        href: '/admins',
        icon: Shield,
        roles: ['admin'],
        group: 'Admin',
    },
    {
        key: 'audit-logs',
        label: 'Audit Logs',
        href: '/audit-logs',
        icon: Activity,
        roles: ['admin'],
        group: 'Admin',
    },
    {
        key: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: Settings,
        group: 'System',
    },
];

export const NAV_GROUPS = [
    { key: 'overview', label: 'Overview' },
    { key: 'content', label: 'Content' },
    { key: 'admin', label: 'Admin' },
    { key: 'system', label: 'System' },
];