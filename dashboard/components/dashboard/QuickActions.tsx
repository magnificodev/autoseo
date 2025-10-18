'use client';

import { 
  Globe, 
  Target, 
  FileText, 
  BarChart3, 
  Plus,
  Settings,
  Download,
  Upload
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface QuickActionsProps {
  title?: string;
  className?: string;
}

export default function QuickActions({ 
  title = 'Quick Actions',
  className = '' 
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'add-site',
      title: 'Add New Site',
      description: 'Connect a new WordPress site',
      icon: <Globe className="w-5 h-5" />,
      href: '/sites/new',
      variant: 'primary'
    },
    {
      id: 'add-keywords',
      title: 'Add Keywords',
      description: 'Track new keywords',
      icon: <Target className="w-5 h-5" />,
      href: '/keywords/new',
      variant: 'secondary'
    },
    {
      id: 'create-content',
      title: 'Create Content',
      description: 'Generate new articles',
      icon: <FileText className="w-5 h-5" />,
      href: '/content/new',
      variant: 'secondary'
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/reports',
      variant: 'secondary'
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports',
      icon: <Download className="w-5 h-5" />,
      onClick: () => console.log('Export data'),
      variant: 'secondary'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      variant: 'secondary'
    }
  ];

  return (
    <div className={`modern-card ${className}`}>
      <div className="modern-card-header">
        <h3 className="modern-card-title">{title}</h3>
      </div>
      <div className="modern-card-content">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => {
            const ActionComponent = action.href ? 'a' : 'button';
            const isPrimary = action.variant === 'primary';
            
            return (
              <ActionComponent
                key={action.id}
                href={action.href}
                onClick={action.onClick}
                className={`modern-btn w-full ${
                  isPrimary ? 'modern-btn-primary' : 'modern-btn-secondary'
                }`}
              >
                {action.icon}
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-75">{action.description}</div>
                </div>
              </ActionComponent>
            );
          })}
        </div>
      </div>
    </div>
  );
}
