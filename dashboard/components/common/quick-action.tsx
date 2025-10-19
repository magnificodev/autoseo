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
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        icon: 'text-blue-600',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-800',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        icon: 'text-emerald-600',
        hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    amber: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        icon: 'text-amber-600',
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-800',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        icon: 'text-green-600',
        hover: 'hover:bg-green-100 dark:hover:bg-green-950/40',
        border: 'border-green-200 dark:border-green-800',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        icon: 'text-purple-600',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-950/40',
        border: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        icon: 'text-orange-600',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-950/40',
        border: 'border-orange-200 dark:border-orange-800',
    },
    red: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        icon: 'text-red-600',
        hover: 'hover:bg-red-100 dark:hover:bg-red-950/40',
        border: 'border-red-200 dark:border-red-800',
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
                            'hover:shadow-md hover:scale-[1.02]',
                            colors.hover,
                            colors.border,
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
