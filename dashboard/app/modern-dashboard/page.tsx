'use client';

import { 
  Globe, 
  Target, 
  FileText, 
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import ModernChart from '@/components/dashboard/ModernChart';

export default function ModernDashboardPage() {
  // Sample data - replace with real data from API
  const metrics = [
    {
      title: 'Active Sites',
      value: '12',
      change: { value: 20.1, type: 'positive' as const, period: 'from last month' },
      icon: <Globe className="w-6 h-6" />
    },
    {
      title: 'Keywords Tracked',
      value: '1,247',
      change: { value: 180.1, type: 'positive' as const, period: 'from last month' },
      icon: <Target className="w-6 h-6" />
    },
    {
      title: 'Content Published',
      value: '89',
      change: { value: 19, type: 'positive' as const, period: 'from last month' },
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: 'Avg. Ranking',
      value: '#8.2',
      change: { value: 201, type: 'positive' as const, period: 'since last hour' },
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  const activities = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Content published on "Tech News Blog"',
      description: 'Article "AI Automation Trends 2024" successfully published',
      time: '2 hours ago',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New keyword "AI automation" added',
      description: 'Added to 3 sites for tracking',
      time: '4 hours ago',
      icon: <Target className="w-5 h-5" />
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Site "Marketing Blog" needs attention',
      description: 'WordPress connection timeout',
      time: '6 hours ago',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Content scheduled for "Business Blog"',
      description: '"Digital Marketing Tips" scheduled for tomorrow 9:00 AM',
      time: '8 hours ago',
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const chartData = [
    { label: 'Jan', value: 1200, change: 12 },
    { label: 'Feb', value: 1900, change: 8 },
    { label: 'Mar', value: 3000, change: 15 },
    { label: 'Apr', value: 2800, change: -7 },
    { label: 'May', value: 1890, change: -32 },
    { label: 'Jun', value: 2390, change: 26 },
    { label: 'Jul', value: 3490, change: 46 },
    { label: 'Aug', value: 4200, change: 20 },
    { label: 'Sep', value: 3800, change: -10 },
    { label: 'Oct', value: 4500, change: 18 }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Hi, Welcome back 👋
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your SEO automation today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Jan 20, 2023 - Feb 09, 2023
          </div>
          <button className="modern-btn modern-btn-secondary">
            <BarChart3 className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            className="modern-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <ModernChart 
            title="Total Visitors for the Last 3 Months"
            data={chartData}
            type="bar"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityFeed activities={activities} />
        
        {/* System Status */}
        <div className="modern-card">
          <div className="modern-card-header">
            <h3 className="modern-card-title">System Status</h3>
          </div>
          <div className="modern-card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">WordPress API</span>
                <span className="modern-badge modern-badge-success">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">OpenAI API</span>
                <span className="modern-badge modern-badge-success">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="modern-badge modern-badge-success">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Queue Workers</span>
                <span className="modern-badge modern-badge-warning">3/5 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="modern-card">
        <div className="modern-card-header">
          <h3 className="modern-card-title">Performance Overview</h3>
        </div>
        <div className="modern-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">94.2%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">2.3s</div>
              <div className="text-gray-400">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1,247</div>
              <div className="text-gray-400">Total Requests Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
