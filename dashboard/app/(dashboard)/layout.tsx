'use client';

import { AppShell } from '@/components/layout/app-shell';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
    return (
        <AppShell title={title} description={description}>
            {children}
        </AppShell>
    );
}
