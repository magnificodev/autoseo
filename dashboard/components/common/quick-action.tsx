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
    badge?: string;
    className?: string;
}

export function QuickAction({
    title,
    description,
    icon: Icon,
    href,
    badge,
    className,
}: QuickActionProps) {

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card
                        className={cn(
                            'group relative overflow-hidden transition-all duration-200 cursor-pointer',
                            'hover:shadow-sm hover:scale-[1.01] hover:bg-muted/50',
                            className
                        )}
                    >
                        <Link href={href} className="block">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-muted transition-colors">
                                        <Icon className="h-5 w-5 text-muted-foreground" />
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
