'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  LogOut, 
  LogIn, 
  UserPlus,
  Shield,
  Loader2
} from 'lucide-react';

type User = {
    id: number;
    email: string;
    name?: string;
    role?: {
        id: number;
        name: string;
    };
};

export default function ClientAuthLinks() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    // Not authenticated, this is normal
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            setUser(null);
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
        );
    }

    if (user) {
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

        return (
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Xin chào, </span>
                            <span className="font-medium text-foreground">{user.name || user.email}</span>
                        </div>
                    </div>
                    {user.role && (
                        <Badge 
                            variant={getRoleBadgeVariant(user.role.name)}
                            className="flex items-center space-x-1"
                        >
                            {user.role.name === 'admin' && <Shield className="h-3 w-3" />}
                            <span className="capitalize">{user.role.name}</span>
                        </Badge>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2"
            >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
            </Button>
            <Button
                size="sm"
                onClick={() => router.push('/register')}
                className="flex items-center space-x-2"
            >
                <UserPlus className="h-4 w-4" />
                <span>Đăng ký</span>
            </Button>
        </div>
    );
}