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
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    Plus,
    RefreshCw,
    Shield,
    UserPlus,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RoleApplication {
    id: number;
    user_email: string;
    requested_role: string;
    reason: string;
    status: string;
    admin_notes: string;
    created_at: string;
    reviewed_at: string;
    reviewer_email: string;
}

export default function RoleApplicationsPage() {
    const [applications, setApplications] = useState<RoleApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applyForm, setApplyForm] = useState({
        requested_role: 'manager',
        reason: '',
    });
    const [reviewForm, setReviewForm] = useState<{
        [key: number]: { status: string; admin_notes: string };
    }>({});

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/role-applications/');
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const response = await fetch('/api/role-applications/my-applications');
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (error) {
            console.error('Error fetching my applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/role-applications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applyForm),
            });

            if (response.ok) {
                setShowApplyForm(false);
                setApplyForm({ requested_role: 'manager', reason: '' });
                fetchMyApplications();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Failed to submit application');
        }
    };

    const handleReview = async (applicationId: number) => {
        const review = reviewForm[applicationId];
        if (!review) return;

        try {
            const response = await fetch(`/api/role-applications/${applicationId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(review),
            });

            if (response.ok) {
                setReviewForm((prev) => {
                    const newForm = { ...prev };
                    delete newForm[applicationId];
                    return newForm;
                });
                fetchApplications();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to review application');
            }
        } catch (error) {
            console.error('Error reviewing application:', error);
            alert('Failed to review application');
        }
    };

    const handleCancel = async (applicationId: number) => {
        if (!confirm('Are you sure you want to cancel this application?')) return;

        try {
            const response = await fetch(`/api/role-applications/${applicationId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMyApplications();
            } else {
                const error = await response.json();
                alert(error.detail || 'Failed to cancel application');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            alert('Failed to cancel application');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Role Applications
                        </h1>
                        <p className="text-muted-foreground">
                            Manage role upgrade requests and applications
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Role Applications
                    </h1>
                    <p className="text-muted-foreground">
                        Manage role upgrade requests and applications
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchApplications} variant="outline" className="shrink-0">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Dialog open={showApplyForm} onOpenChange={setShowApplyForm}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" />
                                <span>Apply for Role</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Apply for Role</span>
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleApply} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="requested_role">Requested Role</Label>
                                    <Select
                                        value={applyForm.requested_role}
                                        onValueChange={(value) =>
                                            setApplyForm((prev) => ({
                                                ...prev,
                                                requested_role: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason</Label>
                                    <Textarea
                                        id="reason"
                                        value={applyForm.reason}
                                        onChange={(e) =>
                                            setApplyForm((prev) => ({
                                                ...prev,
                                                reason: e.target.value,
                                            }))
                                        }
                                        placeholder="Explain why you want this role..."
                                        rows={4}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowApplyForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Submit Application</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Applications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Role Applications</span>
                    </CardTitle>
                    <CardDescription>{applications.length} applications found</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Requested Role</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No applications found</p>
                                                <p className="text-xs">
                                                    Apply for a role to get started
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    applications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {app.user_email}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            ID: #{app.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Shield className="h-3 w-3" />
                                                    <span>{app.requested_role.toUpperCase()}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <div
                                                        className="truncate text-sm"
                                                        title={app.reason}
                                                    >
                                                        {app.reason}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        app.status === 'approved'
                                                            ? 'default'
                                                            : app.status === 'rejected'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className="flex items-center space-x-1"
                                                >
                                                    {app.status === 'approved' ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : app.status === 'rejected' ? (
                                                        <XCircle className="h-3 w-3" />
                                                    ) : (
                                                        <Clock className="h-3 w-3" />
                                                    )}
                                                    <span>{app.status.toUpperCase()}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {new Date(
                                                            app.created_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {app.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleCancel(app.id)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                )}
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
