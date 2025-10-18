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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>WordPress URL</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5}>
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
                                <TableCell colSpan={5} className="text-center text-gray-500">
                                    Không có site nào.
                                </TableCell>
                            </TableRow>
                        )}
                        {data?.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="font-medium">#{s.id}</TableCell>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>
                                    <a
                                        className="text-blue-600 hover:underline"
                                        href={s.wp_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {s.wp_url}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={s.is_auto_enabled ? 'default' : 'secondary'}>
                                        {s.is_auto_enabled ? 'Tự động' : 'Thủ công'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" size="sm">
                                                Sửa
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Sửa site: {s.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        Tên site
                                                    </label>
                                                    <Input defaultValue={s.name} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        WordPress URL
                                                    </label>
                                                    <Input defaultValue={s.wp_url} />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="auto-enabled"
                                                        defaultChecked={s.is_auto_enabled}
                                                        className="rounded"
                                                    />
                                                    <label
                                                        htmlFor="auto-enabled"
                                                        className="text-sm"
                                                    >
                                                        Tự động tạo nội dung
                                                    </label>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="secondary">Hủy</Button>
                                                    <Button>Lưu thay đổi</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
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
