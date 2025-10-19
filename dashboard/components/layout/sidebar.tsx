'use client';

import { NAV_GROUPS, NAV_ITEMS } from '@/components/navigation/nav-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/src/hooks/usePermissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    className?: string;
    collapsed?: boolean;
}

export function Sidebar({ className, collapsed = false }: SidebarProps) {
    const pathname = usePathname();
    const { canManageAdmins, canManageSites, canManageContent, canViewAuditLogs, canManageUsers } =
        usePermissions();

    const checkPermission = (item: (typeof NAV_ITEMS)[0]) => {
        if (!item.roles) return true;
        if (item.roles.includes('admin') && canManageAdmins) return true;
        if (item.roles.includes('manager') && canManageSites) return true;
        if (item.key === 'users' && canManageUsers) return true;
        if (item.key === 'role-applications' && canManageUsers) return true;
        if (item.key === 'admins' && canManageAdmins) return true;
        if (item.key === 'audit-logs' && canViewAuditLogs) return true;
        if (item.key === 'sites' && canManageSites) return true;
        if (item.key === 'keywords' && canManageSites) return true;
        if (item.key === 'content-queue' && canManageContent) return true;
        return false;
    };

    const filteredItems = NAV_ITEMS.filter(checkPermission);

    const groupedItems = NAV_GROUPS.map((group) => ({
        ...group,
        items: filteredItems.filter((item) => item.group === group.key),
    })).filter((group) => group.items.length > 0);

    const NavItem = ({ item, collapsed }: { item: (typeof NAV_ITEMS)[0]; collapsed: boolean }) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        const navButton = (
            <Button
                variant="ghost"
                className={cn(
                    'w-full justify-start h-11 px-3',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    collapsed && 'px-2'
                )}
                asChild
            >
                <Link href={item.href}>
                    <Icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {isActive && !collapsed && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground ml-auto" />
                    )}
                </Link>
            </Button>
        );

        if (collapsed) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{item.label}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return navButton;
    };

    return (
        <aside
            className={cn(
                'hidden md:flex md:flex-col border-r bg-card',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">A</span>
                    </div>
                    {!collapsed && (
                        <div>
                            <span className="text-xl font-bold text-foreground">Autoseo</span>
                            <p className="text-xs text-muted-foreground">SEO Automation</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {groupedItems.map((group) => (
                        <div key={group.key} className="space-y-2">
                            {!collapsed && (
                                <>
                                    <div className="px-3 py-1">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {group.label}
                                        </h3>
                                    </div>
                                    <Separator className="mx-3" />
                                </>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <NavItem key={item.key} item={item} collapsed={collapsed} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Version 1.0.0</div>
                        <Badge variant="secondary" className="text-xs">
                            Beta
                        </Badge>
                    </div>
                </div>
            )}
        </aside>
    );
}
