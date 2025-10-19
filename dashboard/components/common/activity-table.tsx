'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Globe, LucideIcon, Users } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error' | 'publish' | 'site';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
}

interface ActivityTableProps {
    activities: ActivityItem[];
    maxHeight?: string;
    className?: string;
}

const getActivityIcon = (type: ActivityItem['type']): LucideIcon => {
    switch (type) {
        case 'success':
        case 'publish':
            return CheckCircle;
        case 'warning':
            return AlertCircle;
        case 'info':
            return Users;
        case 'error':
            return AlertCircle;
        case 'site':
            return Globe;
        default:
            return Clock;
    }
};

const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
        case 'success':
        case 'publish':
            return 'text-green-600 bg-green-50 dark:bg-green-950/20';
        case 'warning':
            return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
        case 'info':
            return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
        case 'error':
            return 'text-red-600 bg-red-50 dark:bg-red-950/20';
        case 'site':
            return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
        default:
            return 'text-muted-foreground bg-muted';
    }
};

export function ActivityTable({
    activities,
    maxHeight = 'max-h-72',
    className,
}: ActivityTableProps) {
    if (activities.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>System activity and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No recent activity</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>System activity and events</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className={cn('px-6', maxHeight)}>
                    <div className="space-y-4 py-4">
                        {activities.map((activity, index) => {
                            const Icon = getActivityIcon(activity.type);
                            const colorClass = getActivityColor(activity.type);

                            return (
                                <div key={activity.id}>
                                    <div className="flex items-start space-x-3">
                                        <div className={cn('p-2 rounded-lg', colorClass)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-foreground">
                                                    {activity.title}
                                                </h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.timestamp}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {activity.description}
                                            </p>
                                            {activity.user && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    by {activity.user}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {index < activities.length - 1 && (
                                        <Separator className="mt-4" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
