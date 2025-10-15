'use client';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Content = { site_id: number; title: string; body?: string | null; status?: string };

export default function ContentPage() {
    const router = useRouter();
    const [items, setItems] = useState<Content[]>([]);
    const [form, setForm] = useState<Content>({
        site_id: 1,
        title: '',
        body: '',
        status: 'pending',
    });
    const [error, setError] = useState<string | null>(null);

    async function load() {
        try {
            const rows = await apiFetch<Content[]>('/content/');
            setItems(rows);
        } catch (e: any) {
            setError(e.message);
        }
    }

    useEffect(() => {
        load();
    }, [router]);

    async function createContent(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await apiFetch<Content>('/content/', { method: 'POST', body: JSON.stringify(form) });
            await load();
            setForm({ site_id: 1, title: '', body: '', status: 'pending' });
        } catch (e: any) {
            setError(e.message);
        }
    }

    return (
        <main style={{ padding: 16, fontFamily: 'sans-serif' }}>
            <h1>Content</h1>
            <form onSubmit={createContent} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
                <input
                    type="number"
                    placeholder="Site ID"
                    value={form.site_id}
                    onChange={(e) => setForm({ ...form, site_id: Number(e.target.value) })}
                />
                <input
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                    placeholder="Body"
                    value={form.body || ''}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
                <button type="submit">Create</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <h2 style={{ marginTop: 24 }}>List</h2>
            <ul>
                {items.map((c, i) => (
                    <li key={i}>
                        [{c.site_id}] {c.title} – {c.status || 'pending'}
                    </li>
                ))}
            </ul>
        </main>
    );
}
