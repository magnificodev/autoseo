'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, User, Activity as ActivityIcon } from 'lucide-react';

interface ActivityRow {
    id: string;
    action: string;
    user: string;
    time: string;
    type: 'success' | 'warning' | 'info' | 'error';
    target?: string;
    meta?: string;
}

interface ActivityTableProps {
    rows: ActivityRow[];
    className?: string;
}

export function ActivityTable({ rows, className }: ActivityTableProps) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <div className="h-2 w-2 rounded-full bg-green-500" />;
            case 'warning':
                return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
            case 'error':
                return <div className="h-2 w-2 rounded-full bg-red-500" />;
            default:
                return <div className="h-2 w-2 rounded-full bg-blue-500" />;
        }
    };

    const getTypeVariant = (type: string) => {
        switch (type) {
            case 'success':
                return 'default';
            case 'warning':
                return 'secondary';
            case 'error':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <ActivityIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                <p className="text-muted-foreground">Activity will appear here as users interact with the system.</p>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg border', className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2">Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>
                                {getTypeIcon(row.type)}
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <p className="font-medium">{row.action}</p>
                                    {row.meta && (
                                        <p className="text-sm text-muted-foreground">{row.meta}</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="" alt={row.user} />
                                        <AvatarFallback className="text-xs">
                                            {row.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{row.user}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {row.target && (
                                    <Badge variant={getTypeVariant(row.type)} className="text-xs">
                                        {row.target}
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{row.time}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
