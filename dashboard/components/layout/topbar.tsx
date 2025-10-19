'use client';

import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { cn } from '@/lib/utils';
import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopbarProps {
    title?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Topbar({ title, description, className, children }: TopbarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-40 border-b bg-card/50 backdrop-blur-sm transition-shadow',
                scrolled && 'shadow-sm',
                className
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button - will be handled by parent */}
                    {children}

                    {/* Page title and description */}
                    <div className="hidden md:block">
                        {title && (
                            <div className="space-y-1">
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-3">
                    {/* Search */}
                    <div className="hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search..." className="w-64 pl-9 pr-4" />
                        </div>
                    </div>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                        >
                            3
                        </Badge>
                    </Button>

                    {/* Theme toggle */}
                    <ModeToggle />

                    {/* User dropdown */}
                    <UserDropdown
                        user={{
                            id: 1,
                            email: 'admin@example.com',
                            name: 'Admin User',
                            role: { id: 1, name: 'admin' },
                        }}
                        onLogout={() => {}}
                    />
                </div>
            </div>
        </header>
    );
}
