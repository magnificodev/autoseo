'use client';

import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Site = {
    id: number;
    name: string;
    wp_url: string;
    is_auto_enabled?: boolean;
};

const fetcher = (url: string) =>
    fetch(url, { credentials: 'include' }).then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });

export default function SitesPage() {
    const [page, setPage] = React.useState(1);
    const [q, setQ] = React.useState('');
    const limit = 10;

    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (q.trim()) params.set('q', q.trim());

    const { data, error, isLoading, mutate } = useSWR<Site[]>(
        `/api/sites/?${params.toString()}`,
        fetcher
    );

    function next() {
        setPage((p) => p + 1);
    }
    function prev() {
        setPage((p) => Math.max(1, p - 1));
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Tìm theo tên hoặc URL"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <Button onClick={() => mutate()} className="shrink-0">
                    Làm mới
                </Button>
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
                                <td className="px-3 py-3" colSpan={4}>
                                    Đang tải...
                                </td>
                            </tr>
                        )}
                        {data?.length === 0 && !isLoading && (
                            <tr>
                                <td className="px-3 py-3" colSpan={4}>
                                    Không có site nào.
                                </td>
                            </tr>
                        )}
                        {data?.map((s) => (
                            <tr key={s.id}>
                                <td className="px-3 py-2">#{s.id}</td>
                                <td className="px-3 py-2">{s.name}</td>
                                <td className="px-3 py-2">
                                    <a
                                        className="text-blue-600 hover:underline"
                                        href={s.wp_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {s.wp_url}
                                    </a>
                                </td>
                                <td className="px-3 py-2">{s.is_auto_enabled ? '🟢' : '🔴'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={prev} disabled={page === 1}>
                    Trang trước
                </Button>
                <div className="text-sm text-gray-600">Trang {page}</div>
                <Button variant="secondary" onClick={next} disabled={data && data.length < limit}>
                    Trang sau
                </Button>
            </div>
        </div>
    );
}
