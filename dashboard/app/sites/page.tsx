'use client';
import { apiFetch } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Site = { name: string; wp_url: string; wp_username: string; wp_password_enc: string };

export default function SitesPage() {
    const router = useRouter();
    const [items, setItems] = useState<Site[]>([]);
    const [form, setForm] = useState<Site>({
        name: '',
        wp_url: '',
        wp_username: '',
        wp_password_enc: '',
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            router.replace('/login');
            return;
        }
        apiFetch<Site[]>('/sites/')
            .then(setItems)
            .catch((e) => setError(e.message));
    }, [router]);

    async function createSite(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await apiFetch<Site>('/sites/', { method: 'POST', body: JSON.stringify(form) });
            const next = await apiFetch<Site[]>('/sites/');
            setItems(next);
            setForm({ name: '', wp_url: '', wp_username: '', wp_password_enc: '' });
        } catch (e: any) {
            setError(e.message);
        }
    }

    return (
        <main style={{ padding: 16, fontFamily: 'sans-serif' }}>
            <h1>Sites</h1>
            <form onSubmit={createSite} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    placeholder="WP URL"
                    value={form.wp_url}
                    onChange={(e) => setForm({ ...form, wp_url: e.target.value })}
                />
                <input
                    placeholder="WP Username"
                    value={form.wp_username}
                    onChange={(e) => setForm({ ...form, wp_username: e.target.value })}
                />
                <input
                    placeholder="WP Password (encrypted)"
                    value={form.wp_password_enc}
                    onChange={(e) => setForm({ ...form, wp_password_enc: e.target.value })}
                />
                <button type="submit">Create</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <h2 style={{ marginTop: 24 }}>List</h2>
            <ul>
                {items.map((s, i) => (
                    <li key={i}>
                        {s.name} – {s.wp_url}
                    </li>
                ))}
            </ul>
        </main>
    );
}
