'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';

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
        reason: ''
    });
    const [reviewForm, setReviewForm] = useState<{
        [key: number]: { status: string; admin_notes: string }
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
                setReviewForm(prev => {
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
            rejected: 'destructive'
        } as const;
        
        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Role Applications</h1>
                <Button onClick={() => setShowApplyForm(!showApplyForm)}>
                    Apply for Role
                </Button>
            </div>

            {showApplyForm && (
                <Card className="mb-6 p-6">
                    <h2 className="text-lg font-semibold mb-4">Apply for Role</h2>
                    <form onSubmit={handleApply}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Requested Role
                            </label>
                            <select
                                value={applyForm.requested_role}
                                onChange={(e) => setApplyForm(prev => ({
                                    ...prev,
                                    requested_role: e.target.value
                                }))}
                                className="w-full p-2 border rounded"
                            >
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Reason
                            </label>
                            <Textarea
                                value={applyForm.reason}
                                onChange={(e) => setApplyForm(prev => ({
                                    ...prev,
                                    reason: e.target.value
                                }))}
                                placeholder="Explain why you want this role..."
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Submit Application</Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setShowApplyForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Requested Role</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.user_email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {app.requested_role.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {app.reason}
                                </TableCell>
                                <TableCell>{getStatusBadge(app.status)}</TableCell>
                                <TableCell>
                                    {new Date(app.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {app.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleCancel(app.id)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
