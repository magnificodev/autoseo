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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Globe,
    RefreshCw,
    Search,
    XCircle,
} from 'lucide-react';
import React from 'react';
import useSWR from 'swr';

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
    pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
    approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
    rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
    published: { variant: 'outline' as const, label: 'Published', icon: FileText },
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Content Queue
                    </h1>
                    <p className="text-muted-foreground">
                        Review and manage content awaiting approval
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search Content</CardTitle>
                    <CardDescription>Find content by title, status, or site</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or content"
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
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
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
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Content Items</CardTitle>
                    <CardDescription>{data?.length || 0} content items found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Site</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                {data?.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No content found</p>
                                                <p className="text-xs">
                                                    Content will appear here when generated
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data?.map((item) => {
                                    const StatusIcon = statusConfig[item.status].icon;
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                #{item.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div
                                                        className="truncate font-medium"
                                                        title={item.title}
                                                    >
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {item.content.substring(0, 100)}...
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {item.site_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={statusConfig[item.status].variant}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <StatusIcon className="h-3 w-3" />
                                                    <span>{statusConfig[item.status].label}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle className="flex items-center space-x-2">
                                                                    <FileText className="h-5 w-5" />
                                                                    <span>{item.title}</span>
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                                        <div className="flex items-center space-x-1">
                                                                            <Globe className="h-4 w-4" />
                                                                            <span>
                                                                                {item.site_name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-1">
                                                                            <Calendar className="h-4 w-4" />
                                                                            <span>
                                                                                {new Date(
                                                                                    item.created_at
                                                                                ).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <Badge
                                                                            variant={
                                                                                statusConfig[
                                                                                    item.status
                                                                                ].variant
                                                                            }
                                                                        >
                                                                            {
                                                                                statusConfig[
                                                                                    item.status
                                                                                ].label
                                                                            }
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <h4 className="text-sm font-medium">
                                                                        Content Preview
                                                                    </h4>
                                                                    <ScrollArea className="h-96 w-full rounded-md border p-4">
                                                                        <div className="whitespace-pre-wrap text-sm">
                                                                            {item.content}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </div>
                                                                <div className="flex justify-end space-x-2 pt-4">
                                                                    <Button variant="outline">
                                                                        Close
                                                                    </Button>
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
                                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                                Reject
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() =>
                                                                                    handleStatusChange(
                                                                                        item.id,
                                                                                        'approved'
                                                                                    )
                                                                                }
                                                                            >
                                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                                Approve
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
                                                                    handleStatusChange(
                                                                        item.id,
                                                                        'rejected'
                                                                    )
                                                                }
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        item.id,
                                                                        'approved'
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
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
        </div>
    );
}
