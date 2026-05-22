import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-widest';
    
    const variants = {
      primary: 'bg-upf-primary/10 text-upf-primary border border-upf-primary/20',
      secondary: 'bg-upf-accent/10 text-upf-accent border border-upf-accent/20',
      success: 'bg-semantic-success/10 text-semantic-success border border-semantic-success/20',
      warning: 'bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20',
      danger: 'bg-semantic-danger/10 text-semantic-danger border border-semantic-danger/20',
      outline: 'bg-transparent text-slate-600 border border-slate-300',
      ghost: 'bg-slate-100 text-slate-600',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

