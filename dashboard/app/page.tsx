'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'WordPress sites connected',
      trend: '+2 this week',
      trendDirection: 'up' as const
    },
    {
      title: 'Keywords',
      value: stats.totalKeywords,
      icon: Search,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      description: 'Keywords being tracked',
      trend: '+12% this month',
      trendDirection: 'up' as const
    },
    {
      title: 'Pending Content',
      value: stats.pendingContent,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      description: 'Awaiting approval',
      trend: '-3 from yesterday',
      trendDirection: 'down' as const
    },
    {
      title: 'Published',
      value: stats.publishedContent,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Successfully published',
      trend: '+8 today',
      trendDirection: 'up' as const
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Active users',
      trend: '+1 new user',
      trendDirection: 'up' as const
    },
    {
      title: 'Activity',
      value: stats.recentActivity,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      description: 'Actions today',
      trend: '3 pending',
      trendDirection: 'neutral' as const
    }
  ];

  const quickActions = [
    {
      title: 'Manage Sites',
      description: 'Add or configure WordPress sites',
      icon: Globe,
      href: '/sites',
      color: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20',
      iconColor: 'text-blue-600'
    },
    {
      title: 'View Keywords',
      description: 'Track and manage keywords',
      icon: Search,
      href: '/keywords',
      color: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Content Queue',
      description: 'Review and approve content',
      icon: FileText,
      href: '/content-queue',
      color: 'hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20',
      iconColor: 'text-amber-600'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/users',
      color: 'hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/20',
      iconColor: 'text-purple-600'
    }
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'Content published successfully',
      description: 'New blog post "SEO Best Practices 2024" was published to example.com',
      timestamp: '2 minutes ago',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'warning',
      title: 'New content pending review',
      description: 'Article "Keyword Research Guide" is waiting for approval',
      timestamp: '15 minutes ago',
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'info',
      title: 'New user registered',
      description: 'User mike@example.com joined the platform',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'success',
      title: 'Site connection established',
      description: 'Successfully connected to newsite.com WordPress installation',
      timestamp: '2 hours ago',
      user: 'Admin'
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
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-l-4 ${stat.borderColor} hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-medium text-muted-foreground">
                    {stat.trendDirection === 'up' && <ArrowUpRight className="h-3 w-3 text-green-600" />}
                    {stat.trendDirection === 'down' && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                    <span className={stat.trendDirection === 'up' ? 'text-green-600' : stat.trendDirection === 'down' ? 'text-red-600' : 'text-muted-foreground'}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${action.color} animate-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${(index + 6) * 100}ms` }}
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`p-2.5 rounded-xl bg-muted/50 group-hover:bg-white/80 dark:group-hover:bg-white/10 transition-colors duration-200`}>
                      <Icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors duration-200">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">System Activity</CardTitle>
                <CardDescription>Latest actions and system updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div 
                  key={activity.id}
                  className="flex items-start space-x-4 p-6 hover:bg-muted/50 transition-colors duration-200 animate-in slide-in-from-left-4"
                  style={{ animationDelay: `${(index + 10) * 100}ms` }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    {activity.user && (
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                        <span className="text-xs text-muted-foreground">by {activity.user}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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


