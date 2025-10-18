'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@autoseo.com');
    const [password, setPassword] = useState('admin123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login-cookie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({
                    username: email,
                    password: password,
                }),
            });

            if (response.ok) {
                router.push('/');
                router.refresh();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Đăng nhập thất bại');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập vào Autoseo
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Quản lý SEO tự động</p>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700 text-center">
                            <strong>Test Account:</strong> admin@autoseo.com / admin123
                        </p>
                    </div>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@autoseo.com"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Mật khẩu
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="admin123"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Chưa có tài khoản?{' '}
                            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Đăng ký ngay
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
