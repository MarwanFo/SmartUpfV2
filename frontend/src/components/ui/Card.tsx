import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-3xl border ${glass ? 'glass-panel' : 'bg-white border-slate-200 shadow-sm'} ${hoverable ? (glass ? 'glass-panel-hover' : 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-300') : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-black text-slate-800 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl ${className}`} {...props}>
    {children}
  </div>
);

