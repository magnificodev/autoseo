import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const base = 'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium';
    const map = {
        default: 'border-transparent bg-gray-900 text-white',
        secondary: 'border-transparent bg-gray-100 text-gray-900',
        destructive: 'border-transparent bg-red-600 text-white',
        outline: 'text-gray-900',
    };
    return <span className={cn(base, map[variant], className)} {...props} />;
}

export default Badge;
