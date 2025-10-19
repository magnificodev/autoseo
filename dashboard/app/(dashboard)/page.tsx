'use client';

import { ActivityTable } from '@/components/common/activity-table';
import { QuickAction } from '@/components/common/quick-action';
import { StatCard } from '@/components/common/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Activity,
    BarChart3,
    CheckCircle,
    Clock,
    FileText,
    Globe,
    Search,
    Settings,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
    totalSites: number;
    totalKeywords: number;
    pendingContent: number;
    publishedContent: number;
    totalUsers: number;
    recentActivity: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalSites: 0,
        totalKeywords: 0,
        pendingContent: 0,
        publishedContent: 0,
        totalUsers: 0,
        recentActivity: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStats({
                    totalSites: 5,
                    totalKeywords: 24,
                    pendingContent: 8,
                    publishedContent: 156,
                    totalUsers: 12,
                    recentActivity: 3,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const recentActivity = [
        {
            id: '1',
            action: 'Content published successfully',
            user: 'John Doe',
            time: '2 minutes ago',
            type: 'success' as const,
            target: 'example.com',
            meta: 'New blog post "SEO Best Practices 2024" was published',
        },
        {
            id: '2',
            action: 'New content pending review',
            user: 'Jane Smith',
            time: '15 minutes ago',
            type: 'warning' as const,
            target: 'example.com',
            meta: 'Article "Keyword Research Guide" is waiting for approval',
        },
        {
            id: '3',
            action: 'New user registered',
            user: 'System',
            time: '1 hour ago',
            type: 'info' as const,
            target: 'mike@example.com',
        },
        {
            id: '4',
            action: 'Site connection established',
            user: 'Admin',
            time: '2 hours ago',
            type: 'success' as const,
            target: 'newsite.com',
        },
        {
            id: '5',
            action: 'Keyword research completed',
            user: 'System',
            time: '3 hours ago',
            type: 'success' as const,
            target: 'digital marketing',
            meta: 'Generated 15 new keyword suggestions',
        },
        {
            id: '6',
            action: 'Content generation failed',
            user: 'System',
            time: '4 hours ago',
            type: 'error' as const,
            target: 'AI automation',
            meta: 'Failed due to API rate limit',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-8 w-32" />
                </div>
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
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's what's happening with your SEO automation.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">System Healthy</span>
                    </Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                    title="Total Sites"
                    value={stats.totalSites}
                    hint="WordPress sites connected"
                    delta={{ value: '+2 this week', tone: 'up' }}
                    progress={75}
                    icon={Globe}
                />
                <StatCard
                    title="Keywords"
                    value={stats.totalKeywords}
                    hint="Keywords being tracked"
                    delta={{ value: '+12% this month', tone: 'up' }}
                    progress={85}
                    icon={Search}
                />
                <StatCard
                    title="Pending Content"
                    value={stats.pendingContent}
                    hint="Awaiting approval"
                    delta={{ value: '-3 from yesterday', tone: 'down' }}
                    progress={30}
                    icon={Clock}
                />
                <StatCard
                    title="Published"
                    value={stats.publishedContent}
                    hint="Successfully published"
                    delta={{ value: '+8 today', tone: 'up' }}
                    progress={92}
                    icon={CheckCircle}
                />
                <StatCard
                    title="Users"
                    value={stats.totalUsers}
                    hint="Active users"
                    delta={{ value: '+1 new user', tone: 'up' }}
                    progress={60}
                    icon={Users}
                />
                <StatCard
                    title="Activity"
                    value={stats.recentActivity}
                    hint="Actions today"
                    delta={{ value: '3 pending', tone: 'neutral' }}
                    progress={45}
                    icon={Activity}
                />
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium">Quick Actions</h2>
                    <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                    </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                    <QuickAction
                        title="Manage Sites"
                        description="Add or configure WordPress sites"
                        icon={<Globe className="h-5 w-5 text-muted-foreground" />}
                        href="/sites"
                        badge="5 sites"
                    />
                    <QuickAction
                        title="View Keywords"
                        description="Track and manage keywords"
                        icon={<Search className="h-5 w-5 text-muted-foreground" />}
                        href="/keywords"
                        badge="24 active"
                    />
                    <QuickAction
                        title="Content Queue"
                        description="Review and approve content"
                        icon={<FileText className="h-5 w-5 text-muted-foreground" />}
                        href="/content-queue"
                        badge="8 pending"
                    />
                    <QuickAction
                        title="User Management"
                        description="Manage users and permissions"
                        icon={<Users className="h-5 w-5 text-muted-foreground" />}
                        href="/users"
                        badge="12 users"
                    />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium">Recent Activity</h2>
                    <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View All
                    </Button>
                </div>
                <div className="max-h-72 overflow-auto">
                    <ActivityTable rows={recentActivity} />
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-muted">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Performance</CardTitle>
                                <CardDescription>Key metrics overview</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Content Published
                            </span>
                            <span className="text-sm font-bold">+24%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Site Performance
                            </span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                Excellent
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                SEO Score
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                92/100
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-lg bg-muted">
                                <Zap className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Automation Status</CardTitle>
                                <CardDescription>Current automation tasks</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Scheduled Posts
                            </span>
                            <Badge variant="secondary">3 pending</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Keyword Research
                            </span>
                            <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                Content Generation
                            </span>
                            <Badge variant="default">Running</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
