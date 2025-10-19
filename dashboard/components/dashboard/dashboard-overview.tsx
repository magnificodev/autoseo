'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap } from 'lucide-react';

export function DashboardOverview() {
    return (
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
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            SEO Score
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">92/100</span>
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
                        <Badge variant="secondary" className="text-xs">
                            3 pending
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Keyword Research
                        </span>
                        <Badge variant="outline" className="text-xs">
                            Active
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                            Content Generation
                        </span>
                        <Badge variant="default" className="text-xs">
                            Running
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
