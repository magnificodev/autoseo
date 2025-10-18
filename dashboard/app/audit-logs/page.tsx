'use client';

import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/Table';

type AuditLog = {
    id: number;
    actor_user_id: number;
    action: string;
    target_type: string;
    target_id: number;
    note?: string | null;
    created_at?: string | null;
};

const actionConfig = {
    approve: { variant: 'default' as const, label: 'Duyệt' },
    reject: { variant: 'destructive' as const, label: 'Từ chối' },
    publish: { variant: 'outline' as const, label: 'Xuất bản' },
    create: { variant: 'secondary' as const, label: 'Tạo mới' },
    update: { variant: 'secondary' as const, label: 'Cập nhật' },
    delete: { variant: 'destructive' as const, label: 'Xóa' },
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [action, setAction] = useState<string>('');
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [downloading, setDownloading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function safeJson(res: Response) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) return res.json();
        const text = await res.text();
        throw new Error(text.slice(0, 300));
    }

    async function loadLogs() {
        try {
            setIsLoading(true);
            setError(null);
            const params = new URLSearchParams();
            params.set('limit', '200');
            if (action.trim()) params.set('action', action.trim());
            if (start.trim()) params.set('start', start.trim());
            if (end.trim()) params.set('end', end.trim());
            const res = await fetch(`/api/audit-logs/?${params.toString()}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await safeJson(res);
            setLogs(data);
        } catch (e: any) {
            setError(e.message || 'Error');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Audit Logs</h1>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    loadLogs();
                }}
                className="flex items-center gap-2 flex-wrap"
            >
                <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Tất cả hành động</option>
                    <option value="approve">Duyệt</option>
                    <option value="reject">Từ chối</option>
                    <option value="publish">Xuất bản</option>
                    <option value="create">Tạo mới</option>
                    <option value="update">Cập nhật</option>
                    <option value="delete">Xóa</option>
                </select>
                <Input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="Từ ngày"
                />
                <Input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    placeholder="Đến ngày"
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang tải...' : 'Lọc'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    disabled={downloading}
                    onClick={async () => {
                        try {
                            setDownloading(true);
                            const params = new URLSearchParams();
                            params.set('limit', '500');
                            if (action.trim()) params.set('action', action.trim());
                            if (start.trim()) params.set('start', start.trim());
                            if (end.trim()) params.set('end', end.trim());
                            const res = await fetch(`/api/audit-logs/?${params.toString()}`, {
                                credentials: 'include',
                            });
                            if (!res.ok) throw new Error(await res.text());
                            const data: AuditLog[] = await safeJson(res);

                            const headers = [
                                'id',
                                'actor_user_id',
                                'action',
                                'target_type',
                                'target_id',
                                'note',
                                'created_at',
                            ];
                            const escape = (v: any) => {
                                const s = v === null || v === undefined ? '' : String(v);
                                if (s.includes('"') || s.includes(',') || s.includes('\n')) {
                                    return '"' + s.replace(/"/g, '""') + '"';
                                }
                                return s;
                            };
                            const rows = data.map((r) => [
                                r.id,
                                r.actor_user_id,
                                r.action,
                                r.target_type,
                                r.target_id,
                                r.note ?? '',
                                r.created_at ?? '',
                            ]);
                            const csv = [
                                headers.join(','),
                                ...rows.map((row) => row.map(escape).join(',')),
                            ].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `audit_logs_${Date.now()}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        } catch (e: any) {
                            setError(e.message || 'Export error');
                        } finally {
                            setDownloading(false);
                        }
                    }}
                >
                    {downloading ? 'Đang xuất...' : 'Xuất CSV'}
                </Button>
            </form>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Người thực hiện</TableHead>
                            <TableHead>Hành động</TableHead>
                            <TableHead>Đối tượng</TableHead>
                            <TableHead>Ghi chú</TableHead>
                            <TableHead>Thời gian</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {logs.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500">
                                    Không có log nào.
                                </TableCell>
                            </TableRow>
                        )}
                        {logs.map((l) => (
                            <TableRow key={l.id}>
                                <TableCell className="font-medium">#{l.id}</TableCell>
                                <TableCell>User #{l.actor_user_id}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            actionConfig[l.action as keyof typeof actionConfig]
                                                ?.variant || 'secondary'
                                        }
                                    >
                                        {actionConfig[l.action as keyof typeof actionConfig]
                                            ?.label || l.action}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {l.target_type}#{l.target_id}
                                </TableCell>
                                <TableCell className="max-w-xs truncate" title={l.note || ''}>
                                    {l.note || '-'}
                                </TableCell>
                                <TableCell>
                                    {l.created_at
                                        ? new Date(l.created_at).toLocaleString('vi-VN')
                                        : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
