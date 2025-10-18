'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table';

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

export default function AdminRoleApplicationsPage() {
    const [applications, setApplications] = useState<RoleApplication[]>([]);
    const [loading, setLoading] = useState(true);
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
            <h1 className="text-2xl font-bold mb-6">Review Role Applications</h1>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Requested Role</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Review</TableHead>
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
                                    {app.status === 'pending' ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => setReviewForm(prev => ({
                                                        ...prev,
                                                        [app.id]: { ...prev[app.id], status: 'approved' }
                                                    }))}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => setReviewForm(prev => ({
                                                        ...prev,
                                                        [app.id]: { ...prev[app.id], status: 'rejected' }
                                                    }))}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                            <Textarea
                                                placeholder="Admin notes..."
                                                value={reviewForm[app.id]?.admin_notes || ''}
                                                onChange={(e) => setReviewForm(prev => ({
                                                    ...prev,
                                                    [app.id]: { 
                                                        ...prev[app.id], 
                                                        admin_notes: e.target.value 
                                                    }
                                                }))}
                                                rows={2}
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() => handleReview(app.id)}
                                                disabled={!reviewForm[app.id]?.status}
                                            >
                                                Submit Review
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600">
                                            {app.admin_notes && (
                                                <div>Notes: {app.admin_notes}</div>
                                            )}
                                            {app.reviewer_email && (
                                                <div>Reviewed by: {app.reviewer_email}</div>
                                            )}
                                            {app.reviewed_at && (
                                                <div>Reviewed: {new Date(app.reviewed_at).toLocaleDateString()}</div>
                                            )}
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
