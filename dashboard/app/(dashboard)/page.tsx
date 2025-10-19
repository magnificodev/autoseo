'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Zap 
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
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Sites
                        </CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSites}</div>
                        <p className="text-xs text-muted-foreground">WordPress sites connected</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Keywords
                        </CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalKeywords}</div>
                        <p className="text-xs text-muted-foreground">Keywords being tracked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending Content
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingContent}</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Published
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.publishedContent}</div>
                        <p className="text-xs text-muted-foreground">Successfully published</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Active users</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Activity
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentActivity}</div>
                        <p className="text-xs text-muted-foreground">Actions today</p>
                    </CardContent>
                </Card>
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
                    <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-base">Manage Sites</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Add or configure WordPress sites</CardDescription>
                            <Badge variant="secondary" className="mt-2">5 sites</Badge>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-base">View Keywords</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Track and manage keywords</CardDescription>
                            <Badge variant="secondary" className="mt-2">24 active</Badge>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-base">Content Queue</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Review and approve content</CardDescription>
                            <Badge variant="secondary" className="mt-2">8 pending</Badge>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-base">User Management</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Manage users and permissions</CardDescription>
                            <Badge variant="secondary" className="mt-2">12 users</Badge>
                        </CardContent>
                    </Card>
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
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">Content published successfully</p>
                                    <p className="text-sm text-muted-foreground">
                                        New blog post "SEO Best Practices 2024" was published to example.com
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">2 minutes ago</div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">New content pending review</p>
                                    <p className="text-sm text-muted-foreground">
                                        Article "Keyword Research Guide" is waiting for approval
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">15 minutes ago</div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-sm text-muted-foreground">
                                        User mike@example.com joined the platform
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">1 hour ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
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
                            <span className="text-sm font-bold text-green-600">Excellent</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                                SEO Score
                            </span>
                            <span className="text-sm font-bold text-blue-600">92/100</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-muted-foreground" />
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
