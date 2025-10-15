'use client';
import { API_PREFIX } from '@/lib/api';
import React, { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_PREFIX}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: email, password }).toString(),
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/sites';
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            style={{
                display: 'flex',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'sans-serif',
            }}
        >
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 8, minWidth: 320 }}>
                <h1>Autoseo – Login</h1>
                <label>
                    Email
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </label>
                <button disabled={loading} type="submit">
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <p style={{ fontSize: 12, opacity: 0.7 }}>Tip: use test@example.com / 123456</p>
            </form>
        </main>
    );
}
