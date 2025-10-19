'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { usePermissions } from '@/src/hooks/usePermissions';
import {
    AlertCircle,
    Calendar,
    Mail,
    RefreshCw,
    Shield,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type User = {
    id: number;
    email: string;
    role_name: string;
    is_active: boolean;
    created_at: string;
};

type Role = {
    id: number;
    name: string;
    max_users: number;
    permissions: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [assigningRole, setAssigningRole] = useState<number | null>(null);
    const [togglingActive, setTogglingActive] = useState<number | null>(null);

    const { canManageUsers } = usePermissions();

    useEffect(() => {
        if (canManageUsers) {
            fetchUsers();
            fetchRoles();
        }
    }, [canManageUsers]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Không thể tải danh sách người dùng');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/users/roles', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const handleAssignRole = async (userId: number, roleName: string) => {
        setAssigningRole(userId);
        try {
            const response = await fetch('/api/users/assign-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    role_name: roleName,
                }),
            });

            if (response.ok) {
                await fetchUsers(); // Refresh users list
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Không thể thay đổi quyền');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setAssigningRole(null);
        }
    };

    const handleToggleActive = async (userId: number) => {
        setTogglingActive(userId);
        try {
            const response = await fetch(`/api/users/${userId}/toggle-active`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok) {
                await fetchUsers(); // Refresh users list
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Không thể thay đổi trạng thái');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setTogglingActive(null);
        }
    };

    const getRoleBadgeVariant = (roleName: string) => {
        switch (roleName) {
            case 'admin':
                return 'destructive';
            case 'manager':
                return 'default';
            case 'viewer':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    if (!canManageUsers) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Users
                        </h1>
                        <p className="text-muted-foreground">Manage user roles and permissions</p>
                    </div>
                </div>
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Access Denied</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            You don't have permission to access this page. Only admins can manage
                            users.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Users
                        </h1>
                        <p className="text-muted-foreground">Manage user roles and permissions</p>
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
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Users</h1>
                    <p className="text-muted-foreground">
                        Manage user roles and permissions in the system
                    </p>
                </div>
                <Button onClick={fetchUsers} variant="outline" className="shrink-0">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="text-destructive text-sm">{error}</div>
                    </CardContent>
                </Card>
            )}

            {/* User Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admin</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.role_name === 'admin').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Full system access</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Manager</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.role_name === 'manager').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Content management</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Viewer</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.role_name === 'viewer').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Read-only access</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>User Management</span>
                    </CardTitle>
                    <CardDescription>{users.length} users in the system</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.email}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        ID: #{user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getRoleBadgeVariant(user.role_name)}>
                                                {user.role_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.is_active ? 'default' : 'secondary'}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Select
                                                    value={user.role_name}
                                                    onValueChange={(value) =>
                                                        handleAssignRole(user.id, value)
                                                    }
                                                    disabled={assigningRole === user.id}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem
                                                                key={role.id}
                                                                value={role.name}
                                                            >
                                                                {role.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(user.id)}
                                                    disabled={togglingActive === user.id}
                                                >
                                                    {user.is_active ? (
                                                        <UserX className="h-4 w-4" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4" />
                                                    )}
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
        </div>
    );
}
