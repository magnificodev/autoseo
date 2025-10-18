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

type Keyword = {
    id: number;
    keyword: string;
    category: string;
    site_id: number;
    site_name: string;
    status: 'active' | 'inactive' | 'pending';
    search_volume?: number;
    difficulty?: number;
    created_at: string;
    updated_at: string;
};

const fetcher = (url: string) =>
    fetch(url, { credentials: 'include' }).then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });

const statusConfig = {
    active: { variant: 'default' as const, label: 'Hoạt động' },
    inactive: { variant: 'secondary' as const, label: 'Tạm dừng' },
    pending: { variant: 'outline' as const, label: 'Chờ xử lý' },
};

export default function KeywordsPage() {
    const [page, setPage] = React.useState(1);
    const [status, setStatus] = React.useState<string>('');
    const [category, setCategory] = React.useState<string>('');
    const [q, setQ] = React.useState('');
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [editingKeyword, setEditingKeyword] = React.useState<Keyword | null>(null);
    const limit = 10;

    const params = new URLSearchParams({ limit: String(limit), page: String(page) });
    if (q.trim()) params.set('q', q.trim());
    if (status) params.set('status', status);
    if (category) params.set('category', category);

    const { data, error, isLoading, mutate } = useSWR<Keyword[]>(
        `/api/keywords/?${params.toString()}`,
        fetcher,
        {
            onError: (err) => {
                console.error('Keywords API error:', err);
            }
        }
    );

    const { data: sites } = useSWR<{ id: number; name: string }[]>(
        '/api/sites/', 
        fetcher,
        {
            onError: (err) => {
                console.error('Sites API error:', err);
            }
        }
    );

    function next() {
        setPage((p) => p + 1);
    }
    function prev() {
        setPage((p) => Math.max(1, p - 1));
    }

    const handleCreate = async (formData: FormData) => {
        try {
            const response = await fetch('/api/keywords/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    keyword: formData.get('keyword'),
                    category: formData.get('category'),
                    site_id: Number(formData.get('site_id')),
                    status: formData.get('status') || 'active',
                }),
            });
            if (response.ok) {
                setIsCreateOpen(false);
                mutate();
            }
        } catch (err) {
            console.error('Failed to create keyword:', err);
        }
    };

    const handleUpdate = async (formData: FormData) => {
        if (!editingKeyword) return;
        try {
            const response = await fetch(`/api/keywords/${editingKeyword.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    keyword: formData.get('keyword'),
                    category: formData.get('category'),
                    site_id: Number(formData.get('site_id')),
                    status: formData.get('status'),
                }),
            });
            if (response.ok) {
                setIsEditOpen(false);
                setEditingKeyword(null);
                mutate();
            }
        } catch (err) {
            console.error('Failed to update keyword:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa từ khóa này?')) return;
        try {
            const response = await fetch(`/api/keywords/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                mutate();
            }
        } catch (err) {
            console.error('Failed to delete keyword:', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Quản lý từ khóa</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>Thêm từ khóa</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm từ khóa mới</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Từ khóa *</label>
                                <Input name="keyword" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Danh mục</label>
                                <Input name="category" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Site *</label>
                                <select
                                    name="site_id"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">Chọn site</option>
                                    {sites?.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Tạm dừng</option>
                                    <option value="pending">Chờ xử lý</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit">Tạo từ khóa</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Tìm theo từ khóa hoặc danh mục"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm dừng</option>
                    <option value="pending">Chờ xử lý</option>
                </select>
                <Input
                    placeholder="Danh mục"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
                <Button onClick={() => mutate()} className="shrink-0">
                    Làm mới
                </Button>
            </div>

            {error && (
                <div className="text-red-600 text-sm">
                    {String(error.message || error)}
                    <br />
                    <small className="text-gray-500">
                        API endpoint có thể chưa được implement. Kiểm tra console để xem chi tiết.
                    </small>
                </div>
            )}

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Từ khóa</TableHead>
                            <TableHead>Danh mục</TableHead>
                            <TableHead>Site</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Lượt tìm kiếm</TableHead>
                            <TableHead>Độ khó</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8}>
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
                                <TableCell colSpan={8} className="text-center text-gray-500">
                                    Không có từ khóa nào.
                                </TableCell>
                            </TableRow>
                        )}
                        {data?.map((keyword) => (
                            <TableRow key={keyword.id}>
                                <TableCell className="font-medium">#{keyword.id}</TableCell>
                                <TableCell className="font-medium">{keyword.keyword}</TableCell>
                                <TableCell>{keyword.category || '-'}</TableCell>
                                <TableCell>{keyword.site_name}</TableCell>
                                <TableCell>
                                    <Badge variant={statusConfig[keyword.status].variant}>
                                        {statusConfig[keyword.status].label}
                                    </Badge>
                                </TableCell>
                                <TableCell>{keyword.search_volume || '-'}</TableCell>
                                <TableCell>{keyword.difficulty || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setEditingKeyword(keyword);
                                                setIsEditOpen(true);
                                            }}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(keyword.id)}
                                        >
                                            Xóa
                                        </Button>
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

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa từ khóa: {editingKeyword?.keyword}</DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Từ khóa *</label>
                            <Input name="keyword" defaultValue={editingKeyword?.keyword} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Danh mục</label>
                            <Input name="category" defaultValue={editingKeyword?.category} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Site *</label>
                            <select
                                name="site_id"
                                required
                                defaultValue={editingKeyword?.site_id}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                {sites?.map((site) => (
                                    <option key={site.id} value={site.id}>
                                        {site.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Trạng thái</label>
                            <select
                                name="status"
                                defaultValue={editingKeyword?.status}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm dừng</option>
                                <option value="pending">Chờ xử lý</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingKeyword(null);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button type="submit">Lưu thay đổi</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
