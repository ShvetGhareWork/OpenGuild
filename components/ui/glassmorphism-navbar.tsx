"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui';

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

interface GlassmorphismNavbarProps {
  logoUrl?: string;
  navLinks?: NavLink[];
  ctaButtonText?: string;
  ctaButtonHref?: string;
}

const GlassmorphismNavbar: React.FC<GlassmorphismNavbarProps> = ({
  logoUrl,
  navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ],
  ctaButtonText = "Join the Guild",
  ctaButtonHref = "/signup",
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="mx-6 pt-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-4xl font-regular font-medium">
               OpenGuild
              </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium hover:text-white transition-colors ${
                    link.isActive ? 'text-white/90' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={ctaButtonHref}
                className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors"
              >
                {ctaButtonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5 text-white/90" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={ctaButtonHref}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaButtonText}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default GlassmorphismNavbar;
