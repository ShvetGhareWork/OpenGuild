import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, glass, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 transition-all duration-300',
          glass
            ? 'glass'
            : 'bg-bg-secondary border border-white/10',
          hover && 'hover:-translate-y-1 hover:border-accent-cyan/30 hover:shadow-glow-cyan',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
