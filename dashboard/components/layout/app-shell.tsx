'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
    children: ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export function AppShell({ children, title, description, className }: AppShellProps) {
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Topbar */}
                <Topbar title={title} description={description}>
                    <MobileNav />
                </Topbar>

                {/* Main Content Area */}
                <main
                    className={cn(
                        'flex-1 overflow-y-auto bg-background',
                        className
                    )}
                >
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[1400px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
