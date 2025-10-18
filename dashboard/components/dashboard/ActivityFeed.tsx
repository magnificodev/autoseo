'use client';

import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Target, 
  Globe, 
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

export default function ActivityFeed({ 
  activities, 
  title = 'Recent Activity',
  className = '' 
}: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Target className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`modern-card ${className}`}>
      <div className="modern-card-header">
        <h3 className="modern-card-title">{title}</h3>
      </div>
      <div className="modern-card-content">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="modern-activity-item">
              <div className={`modern-activity-icon ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="modern-activity-content">
                <div className="modern-activity-title">{activity.title}</div>
                <div className="modern-activity-description">{activity.description}</div>
                <div className="modern-activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
