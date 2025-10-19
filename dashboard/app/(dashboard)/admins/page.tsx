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
    Bot,
    Calendar,
    Loader2,
    Plus,
    RefreshCw,
    Shield,
    Trash2,
    User,
    UserPlus,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Admin = { user_id: number };

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    async function safeJson(res: Response) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) return res.json();
        const text = await res.text();
        throw new Error(text.slice(0, 300));
    }

    async function fetchAdmins() {
        try {
            setError(null);
            const res = await fetch('/api/admins/', { credentials: 'include' });
            if (!res.ok) throw new Error(await res.text());
            const data = await safeJson(res);
            setAdmins(data);
        } catch (e: any) {
            setError(e.message || 'Error');
        }
    }

    async function addAdmin(e: React.FormEvent) {
        e.preventDefault();
        if (!userId.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admins/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ user_id: Number(userId) }),
            });
            if (!res.ok) throw new Error(await res.text());
            setUserId('');
            setIsAddDialogOpen(false);
            await fetchAdmins();
        } catch (e: any) {
            setError(e.message || 'Error');
        } finally {
            setLoading(false);
        }
    }

    async function removeAdmin(id: number) {
        if (!confirm('Are you sure you want to remove this admin?')) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admins/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(await res.text());
            await fetchAdmins();
        } catch (e: any) {
            setError(e.message || 'Error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Telegram Admins
                    </h1>
                    <p className="text-muted-foreground">Manage Telegram bot administrators</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchAdmins} variant="outline" className="shrink-0">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Add Admin</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Add Telegram Admin</span>
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={addAdmin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">User ID</Label>
                                    <Input
                                        id="user_id"
                                        type="number"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="Enter Telegram user ID"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the Telegram user ID to grant admin privileges
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Admin'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="text-destructive text-sm">{error}</div>
                    </CardContent>
                </Card>
            )}

            {/* Admins Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bot className="h-5 w-5" />
                        <span>Telegram Administrators</span>
                    </CardTitle>
                    <CardDescription>{admins.length} administrators configured</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="space-y-2 py-4">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No admins configured</p>
                                                <p className="text-xs">
                                                    Add Telegram admins to get started
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    admins.map((admin) => (
                                        <TableRow key={admin.user_id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {admin.user_id}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Telegram User ID
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="default"
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Shield className="h-3 w-3" />
                                                    <span>Active</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Recently added</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeAdmin(admin.user_id)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
