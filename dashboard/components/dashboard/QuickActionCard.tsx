'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  badge?: string;
  delay?: number;
}

const colorVariants = {
  blue: {
    hover: 'hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-500'
  },
  emerald: {
    hover: 'hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500'
  },
  amber: {
    hover: 'hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500'
  },
  purple: {
    hover: 'hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/20',
    icon: 'text-purple-600 dark:text-purple-400',
    accent: 'bg-purple-500'
  }
};

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color, 
  badge,
  delay = 0 
}: QuickActionCardProps) {
  const router = useRouter();
  const colors = colorVariants[color];

  const handleClick = () => {
    router.push(href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay * 0.1 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${colors.hover} h-full`}
        onClick={handleClick}
      >
        <CardContent className="p-6">
          {/* Header with icon and external link */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-muted/50 group-hover:bg-white/80 dark:group-hover:bg-white/10 transition-colors duration-200`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            <div className="flex items-center space-x-2">
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          {/* Subtle accent line */}
          <div className={`mt-4 h-0.5 w-0 group-hover:w-full ${colors.accent} transition-all duration-300 rounded-full`} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
