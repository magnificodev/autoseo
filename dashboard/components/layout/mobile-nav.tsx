'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface MobileNavProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileNav({ children, className }: MobileNavProps) {
    const [open, setOpen] = useState(false);

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
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">A</span>
                            </div>
                            <div>
                                <span className="text-xl font-bold text-foreground">Autoseo</span>
                                <p className="text-xs text-muted-foreground">SEO Automation</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Content */}
                    <div className="flex-1 overflow-y-auto p-4">{children}</div>

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
