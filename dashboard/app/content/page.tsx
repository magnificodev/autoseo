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
    const [publishMsg, setPublishMsg] = useState<string | null>(null);
    const [publishStatus, setPublishStatus] = useState<'draft' | 'publish'>('draft');

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
        setPublishMsg(null);
        try {
            await apiFetch<Content>('/content/', { method: 'POST', body: JSON.stringify(form) });
            await load();
            setForm({ site_id: 1, title: '', body: '', status: 'pending' });
        } catch (e: any) {
            setError(e.message);
        }
    }

    async function publish(content: Content) {
        setError(null);
        setPublishMsg(null);
        try {
            const res = await apiFetch<{ ok: boolean; post_id?: number; link?: string; raw?: any }>(
                '/content/publish',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        site_id: content.site_id,
                        title: content.title,
                        body: content.body || '',
                        status: publishStatus,
                    }),
                }
            );
            if (res.ok && res.link) setPublishMsg(`Published: ${res.link}`);
            else setPublishMsg('Published (no link returned).');
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
            <div style={{ marginBottom: 12 }}>
                <label>
                    Publish status:&nbsp;
                    <select value={publishStatus} onChange={(e) => setPublishStatus(e.target.value as 'draft' | 'publish')}>
                        <option value="draft">draft</option>
                        <option value="publish">publish</option>
                    </select>
                </label>
            </div>
            {publishMsg && <p style={{ color: 'green' }}>{publishMsg}</p>}
            <ul>
                {items.map((c, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                        <div>
                            <div>
                                [{c.site_id}] {c.title} – {c.status || 'pending'}
                            </div>
                            <button onClick={() => publish(c)}>Publish to WP (draft)</button>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
