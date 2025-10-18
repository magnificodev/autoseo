'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Activity,
    BarChart3,
    FileText,
    Globe,
    Menu,
    Settings,
    Target,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function RecommendedLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900">AutoSEO Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Activity className="h-3 w-3 mr-1" />
                            System Active
                        </Badge>
                        <Button size="sm" className="gradient-button">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0`}
                >
                    <nav className="p-4 space-y-2">
                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start text-left">
                                <BarChart3 className="h-4 w-4 mr-3" />
                                Dashboard
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left">
                                <Globe className="h-4 w-4 mr-3" />
                                Sites
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left">
                                <Target className="h-4 w-4 mr-3" />
                                Keywords
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left">
                                <FileText className="h-4 w-4 mr-3" />
                                Content Queue
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-left">
                                <Users className="h-4 w-4 mr-3" />
                                Users
                            </Button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="minimalist-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Active Sites
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">12</div>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +2 this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="minimalist-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Keywords Tracked
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">1,247</div>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +156 this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="minimalist-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Content Published
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">89</div>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +12 this week
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="minimalist-card">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    Avg. Ranking
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">#8.2</div>
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +1.3 positions
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2">
                            <Card className="minimalist-card">
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    Content published on "Tech News Blog"
                                                </p>
                                                <p className="text-xs text-gray-500">2 hours ago</p>
                                            </div>
                                            <Badge variant="secondary">Published</Badge>
                                        </div>
                                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    New keyword "AI automation" added
                                                </p>
                                                <p className="text-xs text-gray-500">4 hours ago</p>
                                            </div>
                                            <Badge variant="secondary">Added</Badge>
                                        </div>
                                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    Site "Marketing Blog" needs attention
                                                </p>
                                                <p className="text-xs text-gray-500">6 hours ago</p>
                                            </div>
                                            <Badge variant="secondary">Warning</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <Card className="minimalist-card">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button className="w-full gradient-button">
                                        <Globe className="h-4 w-4 mr-2" />
                                        Add New Site
                                    </Button>
                                    <Button variant="outline" className="w-full minimalist-button">
                                        <Target className="h-4 w-4 mr-2" />
                                        Add Keywords
                                    </Button>
                                    <Button variant="outline" className="w-full minimalist-button">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Create Content
                                    </Button>
                                    <Button variant="outline" className="w-full minimalist-button">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        View Reports
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
