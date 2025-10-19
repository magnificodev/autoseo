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
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    progress?: number;
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    progress,
    className,
}: StatCardProps) {

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
                'relative overflow-hidden transition-all duration-200 hover:shadow-sm',
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
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
