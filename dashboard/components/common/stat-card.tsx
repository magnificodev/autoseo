'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: LucideIcon;
    color?: 'blue' | 'emerald' | 'amber' | 'green' | 'purple' | 'orange' | 'red';
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    progress?: number;
    className?: string;
}

const colorVariants = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        icon: 'text-blue-600',
        accent: 'border-blue-200 dark:border-blue-800',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        icon: 'text-emerald-600',
        accent: 'border-emerald-200 dark:border-emerald-800',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        icon: 'text-amber-600',
        accent: 'border-amber-200 dark:border-amber-800',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        icon: 'text-green-600',
        accent: 'border-green-200 dark:border-green-800',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        icon: 'text-purple-600',
        accent: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        icon: 'text-orange-600',
        accent: 'border-orange-200 dark:border-orange-800',
    },
    red: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        icon: 'text-red-600',
        accent: 'border-red-200 dark:border-red-800',
    },
};

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color = 'blue',
    trend,
    progress,
    className,
}: StatCardProps) {
    const colors = colorVariants[color];

    const getTrendIcon = () => {
        if (!trend) return null;
        switch (trend.direction) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-green-600" />;
            case 'down':
                return <TrendingDown className="h-3 w-3 text-red-600" />;
            default:
                return <Minus className="h-3 w-3 text-muted-foreground" />;
        }
    };

    return (
        <Card
            className={cn(
                'relative overflow-hidden transition-all duration-200 hover:shadow-md',
                colors.accent,
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={cn('p-2 rounded-lg', colors.bg)}>
                    <Icon className={cn('h-4 w-4', colors.icon)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{value}</div>

                    {description && <p className="text-xs text-muted-foreground">{description}</p>}

                    {trend && (
                        <div className="flex items-center space-x-1">
                            {getTrendIcon()}
                            <span className="text-xs text-muted-foreground">{trend.value}</span>
                        </div>
                    )}

                    {progress !== undefined && (
                        <div className="space-y-1">
                            <Progress value={progress} className="h-1" />
                            <div className="text-xs text-muted-foreground">
                                {progress}% complete
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
