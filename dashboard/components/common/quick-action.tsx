'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowUpRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickActionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color?: 'blue' | 'emerald' | 'amber' | 'green' | 'purple' | 'orange' | 'red';
    badge?: string;
    className?: string;
}

const colorVariants = {
    blue: {
        bg: 'bg-muted',
        icon: 'text-blue-600 dark:text-blue-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    emerald: {
        bg: 'bg-muted',
        icon: 'text-emerald-600 dark:text-emerald-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    amber: {
        bg: 'bg-muted',
        icon: 'text-amber-600 dark:text-amber-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    green: {
        bg: 'bg-muted',
        icon: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    purple: {
        bg: 'bg-muted',
        icon: 'text-purple-600 dark:text-purple-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    orange: {
        bg: 'bg-muted',
        icon: 'text-orange-600 dark:text-orange-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
    red: {
        bg: 'bg-muted',
        icon: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-muted/80',
        border: 'border-border',
    },
};

export function QuickAction({
    title,
    description,
    icon: Icon,
    href,
    color = 'blue',
    badge,
    className,
}: QuickActionProps) {
    const colors = colorVariants[color];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card
                        className={cn(
                            'group relative overflow-hidden transition-all duration-200 cursor-pointer',
                            'hover:shadow-sm hover:scale-[1.01]',
                            colors.hover,
                            className
                        )}
                    >
                        <Link href={href} className="block">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div
                                        className={cn(
                                            'p-2 rounded-lg transition-colors',
                                            colors.bg
                                        )}
                                    >
                                        <Icon className={cn('h-5 w-5', colors.icon)} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {badge && (
                                            <Badge variant="secondary" className="text-xs">
                                                {badge}
                                            </Badge>
                                        )}
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <CardTitle className="text-base font-semibold mb-1">
                                    {title}
                                </CardTitle>
                                <CardDescription className="text-sm">{description}</CardDescription>
                            </CardContent>
                        </Link>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Click to {title.toLowerCase()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
