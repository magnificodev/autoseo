'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterBarProps {
    fields: Array<'search' | 'status' | 'dateRange' | 'site' | 'user'>;
    onChange: (state: Record<string, any>) => void;
    defaultState?: Record<string, any>;
    className?: string;
}

export function FilterBar({ fields, onChange, defaultState = {}, className }: FilterBarProps) {
    const [filters, setFilters] = React.useState(defaultState);

    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onChange(newFilters);
    };

    const clearFilter = (key: string) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters(newFilters);
        onChange(newFilters);
    };

    const clearAllFilters = () => {
        setFilters({});
        onChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            {fields.includes('search') && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={filters.search || ''}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        className="pl-9 w-64"
                    />
                </div>
            )}

            {fields.includes('status') && (
                <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            )}

            {fields.includes('site') && (
                <Select value={filters.site || ''} onValueChange={(value) => updateFilter('site', value)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Site" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sites</SelectItem>
                        <SelectItem value="example.com">example.com</SelectItem>
                        <SelectItem value="test.com">test.com</SelectItem>
                    </SelectContent>
                </Select>
            )}

            {fields.includes('user') && (
                <Select value={filters.user || ''} onValueChange={(value) => updateFilter('user', value)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                </Select>
            )}

            {fields.includes('dateRange') && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-48 justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange ? format(filters.dateRange, 'PPP') : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={filters.dateRange}
                            onSelect={(date) => updateFilter('dateRange', date)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 ml-auto">
                    {Object.entries(filters).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                            {key}: {value}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => clearFilter(key)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
