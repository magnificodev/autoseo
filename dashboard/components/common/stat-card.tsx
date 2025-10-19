'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    hint?: string;
    delta?: {
        value: string;
        tone: 'up' | 'down' | 'neutral';
        label?: string;
    };
    progress?: number;
    icon?: LucideIcon;
    className?: string;
}

export function StatCard({
    title,
    value,
    hint,
    delta,
    progress,
    icon: Icon,
    className,
}: StatCardProps) {
    const getTrendIcon = () => {
        if (!delta) return null;
        switch (delta.tone) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
            case 'down':
                return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
            default:
                return <Minus className="h-3 w-3 text-muted-foreground" />;
        }
    };

    const getDeltaVariant = () => {
        if (!delta) return 'secondary';
        switch (delta.tone) {
            case 'up':
                return 'default';
            case 'down':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <Card className={cn('relative overflow-hidden', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && (
                    <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="text-2xl font-bold">{value}</div>

                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

                    {delta && (
                        <div className="flex items-center space-x-1">
                            {getTrendIcon()}
                            <Badge variant={getDeltaVariant()} className="text-xs">
                                {delta.value}
                            </Badge>
                            {delta.label && (
                                <span className="text-xs text-muted-foreground">{delta.label}</span>
                            )}
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
