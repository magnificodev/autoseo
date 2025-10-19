'use client';

import { QuickAction } from '@/components/common/quick-action';
import { Button } from '@/components/ui/button';
import { Settings, Globe, Search, FileText, Users } from 'lucide-react';

interface DashboardQuickActionsProps {
    showCustomize?: boolean;
}

export function DashboardQuickActions({ showCustomize = true }: DashboardQuickActionsProps) {
    const quickActions = [
        {
            title: 'Manage Sites',
            description: 'Add or configure WordPress sites',
            icon: Globe,
            href: '/sites',
            badge: '5 sites',
        },
        {
            title: 'View Keywords',
            description: 'Track and manage keywords',
            icon: Search,
            href: '/keywords',
            badge: '24 active',
        },
        {
            title: 'Content Queue',
            description: 'Review and approve content',
            icon: FileText,
            href: '/content-queue',
            badge: '8 pending',
        },
        {
            title: 'User Management',
            description: 'Manage users and permissions',
            icon: Users,
            href: '/users',
            badge: '12 users',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Quick Actions</h2>
                {showCustomize && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                    </Button>
                )}
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((action, index) => (
                    <QuickAction
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        href={action.href}
                        badge={action.badge}
                    />
                ))}
            </div>
        </div>
    );
}
