'use client';
import { apiFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Content = { site_id: number; title: string; body?: string | null; status?: string };
type Checklist = { passed: boolean; score: number; issues: string[]; warnings: string[] };

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
    const [lastChecklist, setLastChecklist] = useState<Checklist | null>(null);
    const [checking, setChecking] = useState(false);

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
            // run checklist before publish
            setChecking(true);
            const report = await apiFetch<Checklist>('/content/checklist', {
                method: 'POST',
                body: JSON.stringify({ title: content.title, body: content.body || '' }),
            });
            setLastChecklist(report);
            setChecking(false);
            if (!report.passed) {
                // Show detailed panel only; avoid duplicate error banner
                setPublishMsg(null);
                return;
            }
            const res = await apiFetch<{ ok: boolean; post_id?: number; link?: string; raw?: any }>(
                '/content/publish',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        site_id: content.site_id,
                        title: content.title,
                        body: content.body || '',
                        status: 'draft',
                    }),
                }
            );
            if (res.ok && res.link) setPublishMsg(`Published: ${res.link}`);
            else setPublishMsg('Published (no link returned).');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setChecking(false);
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
            {/* Publish status removed for now; defaulting to draft */}
            {publishMsg && <p style={{ color: 'green' }}>{publishMsg}</p>}
            {lastChecklist && (
                <div style={{ border: '1px solid #ddd', padding: 8, marginBottom: 12 }}>
                    <strong>Checklist:</strong> {lastChecklist.passed ? 'Passed' : 'Failed'} (score{' '}
                    {lastChecklist.score})
                    {lastChecklist.issues.length > 0 && (
                        <div style={{ color: 'red' }}>
                            Issues: {lastChecklist.issues.join(', ')}
                        </div>
                    )}
                    {lastChecklist.warnings.length > 0 && (
                        <div style={{ color: '#a60' }}>
                            Warnings: {lastChecklist.warnings.join(', ')}
                        </div>
                    )}
                </div>
            )}
            <ul>
                {items.map((c, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                        <div>
                            <div>
                                [{c.site_id}] {c.title} – {c.status || 'pending'}
                            </div>
                            <button disabled={checking} onClick={() => publish(c)}>
                                {checking ? 'Checking...' : 'Publish to WP'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
