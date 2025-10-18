'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { 
  Globe, 
  Search, 
  FileText, 
  Users, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalSites: number;
  totalKeywords: number;
  pendingContent: number;
  publishedContent: number;
  totalUsers: number;
  recentActivity: number;
}

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    totalKeywords: 0,
    pendingContent: 0,
    publishedContent: 0,
    totalUsers: 0,
    recentActivity: 0
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
          recentActivity: 3
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Sites',
      value: stats.totalSites,
      icon: Globe,
      color: 'blue' as const,
      description: 'WordPress sites connected',
      trend: { value: '+2 this week', direction: 'up' as const },
      progress: 75
    },
    {
      title: 'Keywords',
      value: stats.totalKeywords,
      icon: Search,
      color: 'emerald' as const,
      description: 'Keywords being tracked',
      trend: { value: '+12% this month', direction: 'up' as const },
      progress: 85
    },
    {
      title: 'Pending Content',
      value: stats.pendingContent,
      icon: Clock,
      color: 'amber' as const,
      description: 'Awaiting approval',
      trend: { value: '-3 from yesterday', direction: 'down' as const },
      progress: 30
    },
    {
      title: 'Published',
      value: stats.publishedContent,
      icon: CheckCircle,
      color: 'green' as const,
      description: 'Successfully published',
      trend: { value: '+8 today', direction: 'up' as const },
      progress: 92
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'purple' as const,
      description: 'Active users',
      trend: { value: '+1 new user', direction: 'up' as const },
      progress: 60
    },
    {
      title: 'Activity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'orange' as const,
      description: 'Actions today',
      trend: { value: '3 pending', direction: 'neutral' as const },
      progress: 45
    }
  ];

  const quickActions = [
    {
      title: 'Manage Sites',
      description: 'Add or configure WordPress sites',
      icon: Globe,
      href: '/sites',
      color: 'blue' as const,
      badge: '5 sites'
    },
    {
      title: 'View Keywords',
      description: 'Track and manage keywords',
      icon: Search,
      href: '/keywords',
      color: 'emerald' as const,
      badge: '24 active'
    },
    {
      title: 'Content Queue',
      description: 'Review and approve content',
      icon: FileText,
      href: '/content-queue',
      color: 'amber' as const,
      badge: '8 pending'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/users',
      color: 'purple' as const,
      badge: '12 users'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'publish' as const,
      title: 'Content published successfully',
      description: 'New blog post "SEO Best Practices 2024" was published to example.com',
      timestamp: '2 minutes ago',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'New content pending review',
      description: 'Article "Keyword Research Guide" is waiting for approval',
      timestamp: '15 minutes ago',
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'New user registered',
      description: 'User mike@example.com joined the platform',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'site' as const,
      title: 'Site connection established',
      description: 'Successfully connected to newsite.com WordPress installation',
      timestamp: '2 hours ago',
      user: 'Admin'
    },
    {
      id: '5',
      type: 'success' as const,
      title: 'Keyword research completed',
      description: 'Generated 15 new keyword suggestions for "digital marketing"',
      timestamp: '3 hours ago',
      user: 'System'
    },
    {
      id: '6',
      type: 'error' as const,
      title: 'Content generation failed',
      description: 'Failed to generate content for "AI automation" due to API rate limit',
      timestamp: '4 hours ago',
      user: 'System'
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'info':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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

        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-3 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your SEO automation.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">System Healthy</span>
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            progress={stat.progress}
            delay={index}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              color={action.color}
              badge={action.badge}
              delay={index + 6}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <BarChart3 className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        <RecentActivityList activities={recentActivity} />
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Performance</CardTitle>
                <CardDescription>Key metrics overview</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Content Published</span>
              <span className="text-sm font-bold text-foreground">+24%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Site Performance</span>
              <span className="text-sm font-bold text-green-600">Excellent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">SEO Score</span>
              <span className="text-sm font-bold text-blue-600">92/100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Automation Status</CardTitle>
                <CardDescription>Current automation tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Scheduled Posts</span>
              <Badge variant="secondary" className="text-xs">3 pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Keyword Research</span>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Content Generation</span>
              <Badge variant="default" className="text-xs">Running</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


