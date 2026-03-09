import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary: dark navy → deep purple gradient, white text — matches design screenshot
        primary:
          'rounded-full bg-gradient-to-r from-[#1a1a3e] via-[#2d1b69] to-[#3b1f8c] text-white border border-white/10 shadow-[0_0_20px_rgba(80,40,180,0.3)] hover:shadow-[0_0_28px_rgba(100,60,220,0.5)] hover:brightness-110 hover:-translate-y-px active:translate-y-0',
        secondary:
          'rounded-full bg-white/5 border border-white/15 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/25',
        ghost:
          'rounded-lg text-text-secondary hover:bg-white/8 hover:text-white',
        outline:
          'rounded-full border border-white/20 text-white hover:bg-white/8 hover:border-white/30',
        danger:
          'rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white hover:brightness-110',
      },
      size: {
        sm: 'h-9 px-4 text-sm gap-1.5',
        md: 'h-11 px-6 text-sm gap-2',
        lg: 'h-12 px-8 text-base gap-2',
        xl: 'h-14 px-10 text-lg gap-3',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
