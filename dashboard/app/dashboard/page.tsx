'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    FileText,
    Globe,
    Target,
    TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="seo-bg min-h-screen">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold seo-text-primary">SEO Dashboard</h1>
                        <p className="seo-text-muted">Monitor and manage your SEO automation</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge className="seo-status-active">
                            <Activity className="h-3 w-3 mr-1" />
                            System Active
                        </Badge>
                        <Button className="seo-button-primary">
                            <Globe className="h-4 w-4 mr-2" />
                            Add Site
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="seo-metric-card">
                        <div className="seo-metric-label">Active Sites</div>
                        <div className="seo-metric-value">12</div>
                        <div className="seo-metric-change positive">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +2 this month
                        </div>
                    </Card>

                    <Card className="seo-metric-card">
                        <div className="seo-metric-label">Keywords Tracked</div>
                        <div className="seo-metric-value">1,247</div>
                        <div className="seo-metric-change positive">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +156 this month
                        </div>
                    </Card>

                    <Card className="seo-metric-card">
                        <div className="seo-metric-label">Content Published</div>
                        <div className="seo-metric-value">89</div>
                        <div className="seo-metric-change positive">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12 this week
                        </div>
                    </Card>

                    <Card className="seo-metric-card">
                        <div className="seo-metric-label">Avg. Ranking</div>
                        <div className="seo-metric-value">#8.2</div>
                        <div className="seo-metric-change positive">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +1.3 positions
                        </div>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <Card className="seo-card">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div className="flex-1">
                                            <p className="font-medium seo-text-primary">
                                                Content published on "Tech News Blog"
                                            </p>
                                            <p className="text-sm seo-text-muted">
                                                Article "AI Automation Trends 2024" successfully
                                                published
                                            </p>
                                            <p className="text-xs seo-text-light">2 hours ago</p>
                                        </div>
                                        <Badge className="seo-status-active">Published</Badge>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <Target className="h-5 w-5 text-blue-500" />
                                        <div className="flex-1">
                                            <p className="font-medium seo-text-primary">
                                                New keyword "AI automation" added
                                            </p>
                                            <p className="text-sm seo-text-muted">
                                                Added to 3 sites for tracking
                                            </p>
                                            <p className="text-xs seo-text-light">4 hours ago</p>
                                        </div>
                                        <Badge variant="secondary">Added</Badge>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        <div className="flex-1">
                                            <p className="font-medium seo-text-primary">
                                                Site "Marketing Blog" needs attention
                                            </p>
                                            <p className="text-sm seo-text-muted">
                                                WordPress connection timeout
                                            </p>
                                            <p className="text-xs seo-text-light">6 hours ago</p>
                                        </div>
                                        <Badge className="seo-status-warning">Warning</Badge>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <div className="flex-1">
                                            <p className="font-medium seo-text-primary">
                                                Content scheduled for "Business Blog"
                                            </p>
                                            <p className="text-sm seo-text-muted">
                                                "Digital Marketing Tips" scheduled for tomorrow 9:00
                                                AM
                                            </p>
                                            <p className="text-xs seo-text-light">8 hours ago</p>
                                        </div>
                                        <Badge variant="secondary">Scheduled</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions & Status */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="seo-card">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full seo-button-primary">
                                    <Globe className="h-4 w-4 mr-2" />
                                    Add New Site
                                </Button>
                                <Button variant="outline" className="w-full seo-button">
                                    <Target className="h-4 w-4 mr-2" />
                                    Add Keywords
                                </Button>
                                <Button variant="outline" className="w-full seo-button">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Content
                                </Button>
                                <Button variant="outline" className="w-full seo-button">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    View Reports
                                </Button>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card className="seo-card">
                            <CardHeader>
                                <CardTitle>System Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="seo-text-muted">WordPress API</span>
                                    <Badge className="seo-status-active">Online</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="seo-text-muted">OpenAI API</span>
                                    <Badge className="seo-status-active">Online</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="seo-text-muted">Database</span>
                                    <Badge className="seo-status-active">Healthy</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="seo-text-muted">Queue Workers</span>
                                    <Badge className="seo-status-warning">3/5 Active</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Performance Overview */}
                <Card className="seo-card">
                    <CardHeader>
                        <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold seo-text-primary mb-2">
                                    94.2%
                                </div>
                                <div className="seo-text-muted">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold seo-text-primary mb-2">2.3s</div>
                                <div className="seo-text-muted">Avg Response Time</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold seo-text-primary mb-2">
                                    1,247
                                </div>
                                <div className="seo-text-muted">Total Requests Today</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
