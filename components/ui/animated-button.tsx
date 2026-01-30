"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "primary" | "secondary";
}

export const AnimatedButton = ({
  children,
  href,
  onClick,
  className,
  variant = "default",
}: AnimatedButtonProps) => {
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

  const variantStyles = {
    default: "from-indigo-500 via-purple-500 to-pink-500",
    primary: "from-accent-cyan via-accent-violet to-accent-pink",
    secondary: "from-accent-green via-accent-cyan to-accent-violet",
  };

  const buttonContent = (
    <div className="relative inline-flex items-center justify-center group">
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div
        ref={glowRef}
        className={cn(
          "pointer-events-none absolute w-[200%] h-[200%] rounded-full blur-3xl opacity-40",
          `bg-gradient-to-r ${variantStyles[variant]}`
        )}
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          transition: "transform 150ms ease-out",
          animation: "subtlePulse 6s ease-in-out infinite",
        }}
      />

      {href ? (
        <a
          role="button"
          className={cn(
            "relative inline-flex items-center justify-center gap-2 rounded-xl",
            "glass border border-white/20 px-6 py-3 text-sm font-medium text-white",
            "backdrop-blur-md transition-all duration-300",
            "hover:bg-white/20 hover:border-white/30",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/40",
            className
          )}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : (
        <button
          onClick={onClick}
          className={cn(
            "relative inline-flex items-center justify-center gap-2 rounded-xl",
            "glass border border-white/20 px-6 py-3 text-sm font-medium text-white",
            "backdrop-blur-md transition-all duration-300",
            "hover:bg-white/20 hover:border-white/30",
            "focus:outline-none focus:ring-2 focus:ring-accent-cyan/40",
            className
          )}
        >
          {children}
        </button>
      )}
    </div>
  );

  return buttonContent;
};
