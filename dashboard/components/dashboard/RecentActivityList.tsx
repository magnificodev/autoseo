'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Globe, 
  FileText, 
  Activity,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error' | 'publish' | 'site';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
  maxHeight?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case 'warning':
      return <AlertCircle className={`${iconClass} text-amber-600`} />;
    case 'info':
      return <Users className={`${iconClass} text-blue-600`} />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-red-600`} />;
    case 'publish':
      return <FileText className={`${iconClass} text-emerald-600`} />;
    case 'site':
      return <Globe className={`${iconClass} text-purple-600`} />;
    default:
      return <Activity className={`${iconClass} text-muted-foreground`} />;
  }
};

const getActivityBadge = (type: ActivityItem['type']) => {
  switch (type) {
    case 'success':
      return <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Success</Badge>;
    case 'warning':
      return <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">Warning</Badge>;
    case 'info':
      return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Info</Badge>;
    case 'error':
      return <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Error</Badge>;
    case 'publish':
      return <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">Published</Badge>;
    case 'site':
      return <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">Site</Badge>;
    default:
      return null;
  }
};

export function RecentActivityList({ activities, maxHeight = "max-h-64" }: RecentActivityListProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest actions and system updates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`${maxHeight} overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent`}>
          <div className="divide-y divide-border">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-6 hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center space-x-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      <span className="text-xs text-muted-foreground">by {activity.user}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
