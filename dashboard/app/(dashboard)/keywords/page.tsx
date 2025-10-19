'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Edit, Key, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import React from 'react';
import useSWR from 'swr';

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
            },
        }
    );

    const { data: sites } = useSWR<{ id: number; name: string }[]>('/api/sites/', fetcher, {
        onError: (err) => {
            console.error('Sites API error:', err);
        },
    });

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Keywords
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track keywords for your sites
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Keyword</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <Key className="h-5 w-5" />
                                <span>Add New Keyword</span>
                            </DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyword">Keyword *</Label>
                                <Input
                                    id="keyword"
                                    name="keyword"
                                    placeholder="Enter keyword"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" placeholder="Enter category" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="site_id">Site *</Label>
                                <Select name="site_id" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites?.map((site) => (
                                            <SelectItem key={site.id} value={site.id.toString()}>
                                                {site.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue="active">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Keyword</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search Keywords</CardTitle>
                    <CardDescription>Find keywords by name, category, or status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by keyword or category"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Category filter"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-48"
                        />
                        <Button onClick={() => mutate()} variant="outline" className="shrink-0">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="text-destructive text-sm">
                            {String(error.message || error)}
                            <br />
                            <small className="text-muted-foreground">
                                API endpoint may not be implemented. Check console for details.
                            </small>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Keywords Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Keywords</CardTitle>
                    <CardDescription>{data?.length || 0} keywords found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Keyword</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Search Volume</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <div className="space-y-2 py-4">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data?.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No keywords found</p>
                                                <p className="text-xs">
                                                    Add your first keyword to get started
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data?.map((keyword) => (
                                    <TableRow key={keyword.id}>
                                        <TableCell className="font-medium">#{keyword.id}</TableCell>
                                        <TableCell className="font-medium">
                                            {keyword.keyword}
                                        </TableCell>
                                        <TableCell>{keyword.category || '-'}</TableCell>
                                        <TableCell>{keyword.site_name}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusConfig[keyword.status].variant}>
                                                {statusConfig[keyword.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{keyword.search_volume || '-'}</TableCell>
                                        <TableCell>{keyword.difficulty || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingKeyword(keyword);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(keyword.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {data && data.length > 0 && (
                <div className="flex items-center justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={prev}
                                    className={
                                        page === 1
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink isActive>{page}</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={next}
                                    className={
                                        data && data.length < limit
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Edit className="h-5 w-5" />
                            <span>Edit Keyword: {editingKeyword?.keyword}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <form action={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-keyword">Keyword *</Label>
                            <Input
                                id="edit-keyword"
                                name="keyword"
                                defaultValue={editingKeyword?.keyword}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Input
                                id="edit-category"
                                name="category"
                                defaultValue={editingKeyword?.category}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-site_id">Site *</Label>
                            <Select
                                name="site_id"
                                required
                                defaultValue={editingKeyword?.site_id?.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites?.map((site) => (
                                        <SelectItem key={site.id} value={site.id.toString()}>
                                            {site.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select name="status" defaultValue={editingKeyword?.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingKeyword(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
