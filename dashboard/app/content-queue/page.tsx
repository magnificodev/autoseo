'use client';

import React from 'react';
import useSWR from 'swr';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/Table';

type ContentItem = {
    id: number;
    title: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected' | 'published';
    site_id: number;
    site_name: string;
    created_at: string;
    updated_at: string;
};

const fetcher = (url: string) =>
    fetch(url, { credentials: 'include' }).then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });

const statusConfig = {
    pending: { variant: 'secondary' as const, label: 'Chờ duyệt' },
    approved: { variant: 'default' as const, label: 'Đã duyệt' },
    rejected: { variant: 'destructive' as const, label: 'Từ chối' },
    published: { variant: 'outline' as const, label: 'Đã xuất bản' },
};

export default function ContentQueuePage() {
    const [page, setPage] = React.useState(1);
    const [status, setStatus] = React.useState<string>('');
    const [q, setQ] = React.useState('');
    const limit = 10;

    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);

    const { data, error, isLoading, mutate } = useSWR<ContentItem[]>(
        `/api/content-queue/?${params.toString()}`,
        fetcher
    );

    function next() {
        setPage((p) => p + 1);
    }
    function prev() {
        setPage((p) => Math.max(1, p - 1));
    }

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await fetch(`/api/content-queue/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            mutate();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Tìm theo tiêu đề hoặc nội dung"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                    <option value="published">Đã xuất bản</option>
                </select>
                <Button onClick={() => mutate()} className="shrink-0">
                    Làm mới
                </Button>
            </div>

            {error && <div className="text-red-600 text-sm">{String(error.message || error)}</div>}

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Thao tác</TableHead>
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
                        {data?.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500">
                                    Không có nội dung nào.
                                </TableCell>
                            </TableRow>
                        )}
                        {data?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">#{item.id}</TableCell>
                                <TableCell>
                                    <div className="max-w-xs truncate" title={item.title}>
                                        {item.title}
                                    </div>
                                </TableCell>
                                <TableCell>{item.site_name}</TableCell>
                                <TableCell>
                                    <Badge variant={statusConfig[item.status].variant}>
                                        {statusConfig[item.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="secondary" size="sm">
                                                    Xem
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{item.title}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">
                                                            Nội dung
                                                        </label>
                                                        <div className="p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                                                            <pre className="whitespace-pre-wrap text-sm">
                                                                {item.content}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="secondary">Đóng</Button>
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'rejected'
                                                                        )
                                                                    }
                                                                >
                                                                    Từ chối
                                                                </Button>
                                                                <Button
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            item.id,
                                                                            'approved'
                                                                        )
                                                                    }
                                                                >
                                                                    Duyệt
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        {item.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleStatusChange(item.id, 'rejected')
                                                    }
                                                >
                                                    Từ chối
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusChange(item.id, 'approved')
                                                    }
                                                >
                                                    Duyệt
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
