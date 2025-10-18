'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Shield, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';

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
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý người dùng.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Quản lý người dùng
        </h1>
        <p className="text-gray-600">Quản lý quyền và trạng thái người dùng trong hệ thống</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danh sách người dùng
          </CardTitle>
          <CardDescription>
            Tổng cộng {users.length} người dùng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Quyền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role_name)}>
                      {user.role_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={user.role_name}
                        onValueChange={(value) => handleAssignRole(user.id, value)}
                        disabled={assigningRole === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
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
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role_name === 'admin').length}
            </div>
            <p className="text-xs text-gray-600">Toàn quyền hệ thống</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role_name === 'manager').length}
            </div>
            <p className="text-xs text-gray-600">Quản lý nội dung</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role_name === 'viewer').length}
            </div>
            <p className="text-xs text-gray-600">Chỉ xem</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
