'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Activity, Calendar, Download, Filter, RefreshCw, ScrollText, User } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    approve: { variant: 'default' as const, label: 'Approved' },
    reject: { variant: 'destructive' as const, label: 'Rejected' },
    publish: { variant: 'outline' as const, label: 'Published' },
    create: { variant: 'secondary' as const, label: 'Created' },
    update: { variant: 'secondary' as const, label: 'Updated' },
    delete: { variant: 'destructive' as const, label: 'Deleted' },
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground">
                        Track and monitor system activities and user actions
                    </p>
                </div>
                <Button onClick={loadLogs} variant="outline" className="shrink-0">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filter Logs</span>
                    </CardTitle>
                    <CardDescription>
                        Filter audit logs by action type and date range
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            loadLogs();
                        }}
                        className="flex items-end gap-4 flex-wrap"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="action">Action Type</Label>
                            <Select value={action} onValueChange={setAction}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All actions</SelectItem>
                                    <SelectItem value="approve">Approved</SelectItem>
                                    <SelectItem value="reject">Rejected</SelectItem>
                                    <SelectItem value="publish">Published</SelectItem>
                                    <SelectItem value="create">Created</SelectItem>
                                    <SelectItem value="update">Updated</SelectItem>
                                    <SelectItem value="delete">Deleted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start">From Date</Label>
                            <Input
                                id="start"
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-48"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end">To Date</Label>
                            <Input
                                id="end"
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-48"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={downloading}
                                onClick={async () => {
                                    try {
                                        setDownloading(true);
                                        const params = new URLSearchParams();
                                        params.set('limit', '500');
                                        if (action.trim()) params.set('action', action.trim());
                                        if (start.trim()) params.set('start', start.trim());
                                        if (end.trim()) params.set('end', end.trim());
                                        const res = await fetch(
                                            `/api/audit-logs/?${params.toString()}`,
                                            {
                                                credentials: 'include',
                                            }
                                        );
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
                                            const s =
                                                v === null || v === undefined ? '' : String(v);
                                            if (
                                                s.includes('"') ||
                                                s.includes(',') ||
                                                s.includes('\n')
                                            ) {
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
                                        const blob = new Blob([csv], {
                                            type: 'text/csv;charset=utf-8;',
                                        });
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
                                {downloading ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="text-destructive text-sm">{error}</div>
                    </CardContent>
                </Card>
            )}

            {/* Audit Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <ScrollText className="h-5 w-5" />
                        <span>Audit Logs</span>
                    </CardTitle>
                    <CardDescription>{logs.length} log entries found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="space-y-2 py-4">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No logs found</p>
                                                <p className="text-xs">
                                                    System activities will appear here
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">#{log.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    User #{log.actor_user_id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    actionConfig[
                                                        log.action as keyof typeof actionConfig
                                                    ]?.variant || 'secondary'
                                                }
                                            >
                                                {actionConfig[
                                                    log.action as keyof typeof actionConfig
                                                ]?.label || log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="font-medium">
                                                    {log.target_type}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    #{log.target_id}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div
                                                    className="truncate text-sm"
                                                    title={log.note || ''}
                                                >
                                                    {log.note || '-'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {log.created_at
                                                        ? new Date(log.created_at).toLocaleString()
                                                        : '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
