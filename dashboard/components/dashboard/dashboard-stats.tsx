'use client';

import { StatCard } from '@/components/common/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Activity, CheckCircle, Clock, Globe, Search, Users } from 'lucide-react';

interface DashboardStatsProps {
    loading?: boolean;
    stats?: {
        totalSites: number;
        totalKeywords: number;
        pendingContent: number;
        publishedContent: number;
        totalUsers: number;
        recentActivity: number;
    };
}

export function DashboardStats({ loading = false, stats }: DashboardStatsProps) {
    if (loading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </Card>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Sites',
            value: stats?.totalSites || 0,
            icon: Globe,
            description: 'WordPress sites connected',
            trend: { value: '+2 this week', direction: 'up' as const },
            progress: 75,
        },
        {
            title: 'Keywords',
            value: stats?.totalKeywords || 0,
            icon: Search,
            description: 'Keywords being tracked',
            trend: { value: '+12% this month', direction: 'up' as const },
            progress: 85,
        },
        {
            title: 'Pending Content',
            value: stats?.pendingContent || 0,
            icon: Clock,
            description: 'Awaiting approval',
            trend: { value: '-3 from yesterday', direction: 'down' as const },
            progress: 30,
        },
        {
            title: 'Published',
            value: stats?.publishedContent || 0,
            icon: CheckCircle,
            description: 'Successfully published',
            trend: { value: '+8 today', direction: 'up' as const },
            progress: 92,
        },
        {
            title: 'Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            description: 'Active users',
            trend: { value: '+1 new user', direction: 'up' as const },
            progress: 60,
        },
        {
            title: 'Activity',
            value: stats?.recentActivity || 0,
            icon: Activity,
            description: 'Actions today',
            trend: { value: '3 pending', direction: 'neutral' as const },
            progress: 45,
        },
    ];

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {statCards.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    icon={stat.icon}
                    trend={stat.trend}
                    progress={stat.progress}
                />
            ))}
        </div>
    );
}
