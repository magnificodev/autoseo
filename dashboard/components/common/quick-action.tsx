'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface QuickActionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: string;
    className?: string;
}

export function QuickAction({
    title,
    description,
    icon,
    href,
    onClick,
    badge,
    className,
}: QuickActionProps) {
    const content = (
        <Card
            className={cn(
                'group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-sm hover:scale-[1.01]',
                className
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-muted transition-colors group-hover:bg-muted/80">
                        {icon}
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
                <CardTitle className="text-base font-semibold mb-1">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={href} className="block">
                            {content}
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to {title.toLowerCase()}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (onClick) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div onClick={onClick}>
                            {content}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to {title.toLowerCase()}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return content;
}
