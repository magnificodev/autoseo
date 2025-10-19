'use client';

import { NAV_GROUPS, NAV_ITEMS } from '@/components/navigation/nav-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MobileNavProps {
    className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const hasPermission = (item: (typeof NAV_ITEMS)[0]) => {
        return true; // For demo purposes
    };

    const filteredItems = NAV_ITEMS.filter(hasPermission);
    const groupedItems = NAV_GROUPS.map((group) => ({
        ...group,
        items: filteredItems.filter((item) => item.group === group.key),
    })).filter((group) => group.items.length > 0);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('md:hidden', className)}
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center border-b px-6">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">A</span>
                            </div>
                            <div>
                                <span className="text-lg font-semibold">Autoseo</span>
                                <p className="text-xs text-muted-foreground">SEO Automation</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-6">
                            {groupedItems.map((group) => (
                                <div key={group.key} className="space-y-2">
                                    <div className="px-3 py-1">
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {group.label}
                                        </h3>
                                    </div>
                                    <Separator className="mx-3" />
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href;

                                            return (
                                                <Button
                                                    key={item.key}
                                                    variant="ghost"
                                                    className={cn(
                                                        'w-full justify-start h-11 px-3',
                                                        isActive && 'bg-muted text-foreground'
                                                    )}
                                                    asChild
                                                >
                                                    <Link
                                                        href={item.href}
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <Icon className="h-4 w-4 mr-3" />
                                                        <span className="flex-1 text-left">
                                                            {item.label}
                                                        </span>
                                                    </Link>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">Version 1.0.0</div>
                            <Badge variant="secondary" className="text-xs">
                                Beta
                            </Badge>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
