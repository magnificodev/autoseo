'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserData {
    id: number;
    email: string;
    name?: string;
    full_name?: string;
    role?: {
        id: number;
        name: string;
    };
}

interface UserProfileProps {
    className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();
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

    const getInitials = (name?: string, fullName?: string, email?: string) => {
        const displayName = fullName || name;
        if (displayName) {
            return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getDisplayName = (name?: string, fullName?: string, email?: string) => {
        return fullName || name || email || 'User';
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'default';
            case 'manager':
                return 'secondary';
            case 'viewer':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="hidden md:flex flex-col space-y-1">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-3 py-2 h-auto ${className}`}
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={getDisplayName(user.name, user.full_name, user.email)} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                            {getInitials(user.name, user.full_name, user.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{getDisplayName(user.name, user.full_name, user.email)}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {getDisplayName(user.name, user.full_name, user.email)}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {user.role && (
                            <Badge
                                variant={getRoleBadgeVariant(user.role.name)}
                                className="text-xs px-1.5 py-0.5 h-auto w-fit mt-1"
                            >
                                {user.role.name === 'admin' && <Shield className="h-2.5 w-2.5 mr-1" />}
                                <span className="capitalize">{user.role.name}</span>
                            </Badge>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
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
    );
}
