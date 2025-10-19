'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
    title?: string;
    description?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Topbar({ title, description, className, children }: TopbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-40 border-b bg-background transition-shadow',
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
                                <h1 className="text-xl font-semibold tracking-tight">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 h-auto">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="" alt="Admin User" />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                        AU
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-medium">Admin User</span>
                                    <span className="text-xs text-muted-foreground">admin@example.com</span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        admin@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={handleLogout}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
