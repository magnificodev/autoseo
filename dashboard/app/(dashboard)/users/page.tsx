'use client';

import { FilterBar } from '@/components/common/filter-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    Edit,
    Eye,
    Mail,
    MoreHorizontal,
    Shield,
    Trash2,
    UserPlus,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    email: string;
    full_name?: string;
    name?: string;
    role?: {
        id: number;
        name: string;
    };
    created_at: string;
    last_login?: string;
    is_active: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000));

                setUsers([
                    {
                        id: 1,
                        email: 'admin@example.com',
                        full_name: 'John Doe',
                        role: { id: 1, name: 'admin' },
                        created_at: '2024-01-15T10:30:00Z',
                        last_login: '2024-01-20T14:22:00Z',
                        is_active: true,
                    },
                    {
                        id: 2,
                        email: 'manager@example.com',
                        full_name: 'Jane Smith',
                        role: { id: 2, name: 'manager' },
                        created_at: '2024-01-16T09:15:00Z',
                        last_login: '2024-01-19T16:45:00Z',
                        is_active: true,
                    },
                    {
                        id: 3,
                        email: 'user@example.com',
                        full_name: 'Mike Johnson',
                        role: { id: 3, name: 'viewer' },
                        created_at: '2024-01-17T11:20:00Z',
                        last_login: '2024-01-18T13:30:00Z',
                        is_active: false,
                    },
                    {
                        id: 4,
                        email: 'editor@example.com',
                        full_name: 'Sarah Wilson',
                        role: { id: 2, name: 'manager' },
                        created_at: '2024-01-18T14:10:00Z',
                        last_login: '2024-01-20T10:15:00Z',
                        is_active: true,
                    },
                ]);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getInitials = (name?: string, fullName?: string, email?: string) => {
        const displayName = fullName || name;
        if (displayName) {
            return displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        if (email) {
            return email.slice(0, 2).toUpperCase();
        }
        return 'U';
    };

    const getDisplayName = (name?: string, fullName?: string, email?: string) => {
        return fullName || name || email || 'User';
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'default';
            case 'manager':
                return 'secondary';
            case 'viewer':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </Card>
                    ))}
                </div>

                {/* Table Skeleton */}
                <Card className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Button className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Add User</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Users
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.is_active).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently online</p>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Admins
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.role?.name === 'admin').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Administrators</p>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Managers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {users.filter((u) => u.role?.name === 'manager').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Content managers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">User Management</CardTitle>
                    <CardDescription>View and manage all user accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FilterBar
                        fields={['search', 'status']}
                        onChange={setFilters}
                        defaultState={filters}
                    />

                    {/* Users Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src=""
                                                        alt={getDisplayName(
                                                            user.name,
                                                            user.full_name,
                                                            user.email
                                                        )}
                                                    />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                                                        {getInitials(
                                                            user.name,
                                                            user.full_name,
                                                            user.email
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {getDisplayName(
                                                            user.name,
                                                            user.full_name,
                                                            user.email
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.role && (
                                                <Badge
                                                    variant={getRoleBadgeVariant(user.role.name)}
                                                    className="text-xs"
                                                >
                                                    {user.role.name === 'admin' && (
                                                        <Shield className="h-3 w-3 mr-1" />
                                                    )}
                                                    <span className="capitalize">
                                                        {user.role.name}
                                                    </span>
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.is_active ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDate(user.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {user.last_login
                                                    ? formatDate(user.last_login)
                                                    : 'Never'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
