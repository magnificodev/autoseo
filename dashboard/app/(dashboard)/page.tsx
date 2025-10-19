'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { DashboardActivity } from '@/components/dashboard/dashboard-activity';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { useEffect, useState } from 'react';

interface DashboardStatsData {
    totalSites: number;
    totalKeywords: number;
    pendingContent: number;
    publishedContent: number;
    totalUsers: number;
    recentActivity: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStatsData>({
        totalSites: 0,
        totalKeywords: 0,
        pendingContent: 0,
        publishedContent: 0,
        totalUsers: 0,
        recentActivity: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch dashboard stats
        const fetchStats = async () => {
            try {
                // You can implement actual API calls here
                setStats({
                    totalSites: 5,
                    totalKeywords: 24,
                    pendingContent: 8,
                    publishedContent: 156,
                    totalUsers: 12,
                    recentActivity: 3,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <DashboardHeader />
            <DashboardStats loading={loading} stats={stats} />
            <DashboardQuickActions />
            <DashboardActivity />
            <DashboardOverview />
        </div>
    );
}
