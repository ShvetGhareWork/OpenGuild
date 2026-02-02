"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, AnimatedButtonProps>(
  ({ children, className, href, variant = 'primary', size = 'md', ...props }, ref) => {
    const glowRef = useRef<HTMLDivElement | null>(null);

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

    const sizeClasses = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      icon: 'h-10 w-10 p-2',
    };

    const baseClasses = "relative inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 font-medium text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40";

    const content = (
      <div className="relative inline-flex items-center justify-center group">
        <style>{`
          @keyframes subtlePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.6; }
          }
        `}</style>

        {/* Glow effect - only for primary variant or if explicit */}
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

        {/* The actual button visual */}
        <div
          className={cn(
            baseClasses,
            sizeClasses[size],
            variant !== 'primary' && "bg-transparent border-transparent hover:bg-white/10", // Adjust for other variants
            className
          )}
        >
          {children}
        </div>
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className="no-underline inline-block"
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
        className="bg-transparent border-none p-0 cursor-pointer focus:outline-none"
      >
        {content}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
