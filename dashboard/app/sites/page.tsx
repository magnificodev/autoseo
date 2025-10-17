'use client'

import useSWR from 'swr'
import React from 'react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

type Site = {
  id: number
  name: string
  wp_url: string
  is_auto_enabled?: boolean
}

const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  })

export default function SitesPage() {
  const [page, setPage] = React.useState(1)
  const [q, setQ] = React.useState('')
  const limit = 10

  const params = new URLSearchParams({ limit: String(limit), page: String(page) })
  if (q.trim()) params.set('q', q.trim())

  const { data, error, isLoading, mutate } = useSWR<Site[]>(
    `/api/sites/?${params.toString()}`,
    fetcher,
  )

  function next() {
    setPage((p) => p + 1)
  }
  function prev() {
    setPage((p) => Math.max(1, p - 1))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="Tìm theo tên hoặc URL" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button onClick={() => mutate()} className="shrink-0">Làm mới</Button>
      </div>

      {error && <div className="text-red-600 text-sm">{String(error.message || error)}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">ID</th>
              <th className="px-3 py-2 text-left font-medium">Tên</th>
              <th className="px-3 py-2 text-left font-medium">WordPress URL</th>
              <th className="px-3 py-2 text-left font-medium">Auto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td className="px-3 py-3" colSpan={4}>Đang tải...</td>
              </tr>
            )}
            {data?.length === 0 && !isLoading && (
              <tr>
                <td className="px-3 py-3" colSpan={4}>Không có site nào.</td>
              </tr>
            )}
            {data?.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2">#{s.id}</td>
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2"><a className="text-blue-600 hover:underline" href={s.wp_url} target="_blank" rel="noreferrer">{s.wp_url}</a></td>
                <td className="px-3 py-2">{s.is_auto_enabled ? '🟢' : '🔴'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={prev} disabled={page === 1}>Trang trước</Button>
        <div className="text-sm text-gray-600">Trang {page}</div>
        <Button variant="secondary" onClick={next} disabled={data && data.length < limit}>Trang sau</Button>
      </div>
    </div>
  )
}

'use client';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Site = {
    name: string;
    wp_url: string;
    wp_username: string;
    wp_password_enc: string;
    is_auto_enabled?: boolean | null;
    schedule_cron?: string | null;
    daily_quota?: number | null;
    active_start_hour?: number | null;
    active_end_hour?: number | null;
};

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
    const [updateId, setUpdateId] = useState<number | ''>('');
    const [updateForm, setUpdateForm] = useState<Partial<Site>>({
        is_auto_enabled: true,
        schedule_cron: '0 * * * *',
        daily_quota: 5,
        active_start_hour: 8,
        active_end_hour: 22,
    });

    useEffect(() => {
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
            <h2 style={{ marginTop: 24 }}>Auto Config (Update)</h2>
            <div style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
                <input
                    type="number"
                    placeholder="Site ID"
                    value={updateId}
                    onChange={(e) => setUpdateId(e.target.value ? Number(e.target.value) : '')}
                />
                <label>
                    <input
                        type="checkbox"
                        checked={!!updateForm.is_auto_enabled}
                        onChange={(e) =>
                            setUpdateForm({ ...updateForm, is_auto_enabled: e.target.checked })
                        }
                    />
                    &nbsp;Enable auto
                </label>
                <input
                    placeholder="Cron (e.g. */2 * * * *)"
                    value={updateForm.schedule_cron || ''}
                    onChange={(e) =>
                        setUpdateForm({ ...updateForm, schedule_cron: e.target.value })
                    }
                />
                <input
                    type="number"
                    placeholder="Daily quota"
                    value={updateForm.daily_quota ?? ''}
                    onChange={(e) =>
                        setUpdateForm({ ...updateForm, daily_quota: Number(e.target.value) })
                    }
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="number"
                        placeholder="Active start hour"
                        value={updateForm.active_start_hour ?? ''}
                        onChange={(e) =>
                            setUpdateForm({
                                ...updateForm,
                                active_start_hour: Number(e.target.value),
                            })
                        }
                    />
                    <input
                        type="number"
                        placeholder="Active end hour"
                        value={updateForm.active_end_hour ?? ''}
                        onChange={(e) =>
                            setUpdateForm({
                                ...updateForm,
                                active_end_hour: Number(e.target.value),
                            })
                        }
                    />
                </div>
                <button
                    onClick={async () => {
                        if (updateId === '') return;
                        setError(null);
                        try {
                            await apiFetch(`/sites/${updateId}`, {
                                method: 'PATCH',
                                body: JSON.stringify(updateForm),
                            });
                            const next = await apiFetch<Site[]>('/sites/');
                            setItems(next);
                        } catch (e: any) {
                            setError(e.message);
                        }
                    }}
                >
                    Update Config
                </button>
            </div>
            <h2 style={{ marginTop: 24 }}>List</h2>
            <ul>
                {items.map((s, i) => (
                    <li key={i}>
                        <div>
                            <div>
                                {s.name} – {s.wp_url}
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>
                                auto: {String(s.is_auto_enabled)} | cron: {s.schedule_cron || '-'} |
                                quota: {s.daily_quota ?? '-'} | hours: {s.active_start_hour ?? '-'}–
                                {s.active_end_hour ?? '-'}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
