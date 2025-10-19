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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ExternalLink, Plus, Search, Settings } from 'lucide-react';
import React from 'react';
import useSWR from 'swr';

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sites</h1>
                    <p className="text-muted-foreground">
                        Manage your WordPress sites and automation settings
                    </p>
                </div>
                <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Site</span>
                </Button>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Search Sites</CardTitle>
                    <CardDescription>Find sites by name or URL</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên hoặc URL"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={() => mutate()} variant="outline" className="shrink-0">
                            <Settings className="h-4 w-4 mr-2" />
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

            {/* Sites Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">WordPress Sites</CardTitle>
                    <CardDescription>{data?.length || 0} sites configured</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>WordPress URL</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5}>
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
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No sites found</p>
                                                <p className="text-xs">
                                                    Add your first WordPress site to get started
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {data?.map((site) => (
                                    <TableRow key={site.id}>
                                        <TableCell className="font-medium">#{site.id}</TableCell>
                                        <TableCell className="font-medium">{site.name}</TableCell>
                                        <TableCell>
                                            <a
                                                className="text-primary hover:underline flex items-center space-x-1"
                                                href={site.wp_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <span>{site.wp_url}</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    site.is_auto_enabled ? 'default' : 'secondary'
                                                }
                                            >
                                                {site.is_auto_enabled ? 'Automated' : 'Manual'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Edit Site: {site.name}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="site-name">
                                                                Site Name
                                                            </Label>
                                                            <Input
                                                                id="site-name"
                                                                defaultValue={site.name}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="wp-url">
                                                                WordPress URL
                                                            </Label>
                                                            <Input
                                                                id="wp-url"
                                                                defaultValue={site.wp_url}
                                                            />
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="auto-enabled"
                                                                defaultChecked={
                                                                    site.is_auto_enabled
                                                                }
                                                            />
                                                            <Label htmlFor="auto-enabled">
                                                                Enable automatic content generation
                                                            </Label>
                                                        </div>
                                                        <div className="flex justify-end space-x-2 pt-4">
                                                            <Button variant="outline">
                                                                Cancel
                                                            </Button>
                                                            <Button>Save Changes</Button>
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
