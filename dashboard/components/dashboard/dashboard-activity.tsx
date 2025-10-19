'use client';

import { ActivityTable } from '@/components/common/activity-table';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error' | 'publish' | 'site';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
}

interface DashboardActivityProps {
    activities?: ActivityItem[];
    showViewAll?: boolean;
}

export function DashboardActivity({ 
    activities = [], 
    showViewAll = true 
}: DashboardActivityProps) {
    const defaultActivities: ActivityItem[] = [
        {
            id: '1',
            type: 'publish',
            title: 'Content published successfully',
            description: 'New blog post "SEO Best Practices 2024" was published to example.com',
            timestamp: '2 minutes ago',
            user: 'John Doe',
        },
        {
            id: '2',
            type: 'warning',
            title: 'New content pending review',
            description: 'Article "Keyword Research Guide" is waiting for approval',
            timestamp: '15 minutes ago',
            user: 'Jane Smith',
        },
        {
            id: '3',
            type: 'info',
            title: 'New user registered',
            description: 'User mike@example.com joined the platform',
            timestamp: '1 hour ago',
        },
        {
            id: '4',
            type: 'site',
            title: 'Site connection established',
            description: 'Successfully connected to newsite.com WordPress installation',
            timestamp: '2 hours ago',
            user: 'Admin',
        },
        {
            id: '5',
            type: 'success',
            title: 'Keyword research completed',
            description: 'Generated 15 new keyword suggestions for "digital marketing"',
            timestamp: '3 hours ago',
            user: 'System',
        },
        {
            id: '6',
            type: 'error',
            title: 'Content generation failed',
            description: 'Failed to generate content for "AI automation" due to API rate limit',
            timestamp: '4 hours ago',
            user: 'System',
        },
    ];

    const displayActivities = activities.length > 0 ? activities : defaultActivities;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">Recent Activity</h2>
                {showViewAll && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View All
                    </Button>
                )}
            </div>
            <ActivityTable activities={displayActivities} />
        </div>
    );
}
