import clsx from 'classnames';
import * as React from 'react';

 type InputSize = 'sm' | 'md' | 'lg';
 type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
     size?: InputSize;
 };

 const sizeClasses: Record<InputSize, string> = {
     sm: 'h-8 px-3 text-sm',
     md: 'h-10 px-3 text-sm',
     lg: 'h-12 px-4 text-base',
 };

export function Input({ className, size = 'md', ...props }: InputProps) {
    return (
        <input
            className={clsx(
                'w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
                sizeClasses[size],
                className
            )}
            {...props}
        />
    );
}

export default Input;
