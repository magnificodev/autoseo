'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  progress?: number;
  color: 'blue' | 'emerald' | 'amber' | 'green' | 'purple' | 'orange';
  delay?: number;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-500'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    accent: 'bg-green-500'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    accent: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    accent: 'bg-orange-500'
  }
};

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  progress, 
  color, 
  delay = 0 
}: StatCardProps) {
  const colors = colorVariants[color];

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <ArrowUpRight className="h-3 w-3 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Card className={`group relative overflow-hidden border-l-4 ${colors.border} hover:shadow-lg transition-all duration-300 h-full`}>
        <CardContent className="p-6">
          {/* Header with icon and trend */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform duration-200`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            {trend && (
              <div className="flex items-center space-x-1 text-xs font-medium">
                {getTrendIcon()}
                <span className={getTrendColor()}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="space-y-3">
            <div className="text-3xl font-bold text-foreground">
              {value}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Progress bar */}
            {progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
