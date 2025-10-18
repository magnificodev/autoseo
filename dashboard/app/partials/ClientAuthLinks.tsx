'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
        return <div className="text-sm text-gray-600">Đang tải...</div>;
    }

    if (user) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                    Xin chào, {user.name || user.email}
                    {user.role && (
                        <span className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {user.role.name}
                        </span>
                    )}
                </span>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Đăng xuất
                </Button>
            </div>
        );
    }

    return (
        <Button variant="secondary" size="sm" onClick={() => router.push('/login')}>
            Đăng nhập
        </Button>
    );
}
