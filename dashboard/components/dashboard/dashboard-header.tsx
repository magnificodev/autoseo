'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface DashboardHeaderProps {
    title?: string;
    description?: string;
    showCustomize?: boolean;
}

export function DashboardHeader({ 
    title = "Dashboard", 
    description = "Welcome back! Here's what's happening with your SEO automation.",
    showCustomize = true 
}: DashboardHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">
                    {title}
                </h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium">System Healthy</span>
                </Badge>
                {showCustomize && (
                    <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                    </Button>
                )}
            </div>
        </div>
    );
}