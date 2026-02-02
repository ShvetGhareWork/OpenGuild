"use client";

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef, useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30',
        secondary: 'bg-white/5 text-white backdrop-blur-md border border-white/10 hover:bg-white/10',
        ghost: 'text-white/70 hover:bg-white/10 hover:text-white',
        outline: 'border border-white/20 text-white hover:bg-white/10',
        destructive: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
        link: 'text-white underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
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
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const glow = glowRef.current;
      if (!glow) return;

      const onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        glow.style.transform = `translate(-${50 - (x - 50) / 5}%, -${50 - (y - 50) / 5}%)`;
      };

      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return (
      <div className="relative inline-flex items-center justify-center group">
         <style>{`
          @keyframes subtlePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.6; }
          }
        `}</style>
        {variant === 'primary' && (
             <div
            ref={glowRef}
            className="pointer-events-none absolute w-[200%] h-[200%] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-40"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              transition: "transform 150ms ease-out",
              animation: "subtlePulse 6s ease-in-out infinite",
            }}
          />
        )}
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
