import { Button, Card } from '@/components/ui';
import { ArrowRight, Code2, Users, Trophy, Sparkles, Github, Linkedin, Twitter, Target } from 'lucide-react';
import Link from 'next/link';
import GlassmorphismHero from '@/components/ui/glassmorphism-hero';
import GlassmorphismNavbar from '@/components/ui/glassmorphism-navbar';
import { FeatureBentoGrid } from '@/components/ui/feature-bento-grid';
import HowItWorksSpotlight from '@/components/ui/how-it-works-spotlight';
import TestimonialsGrid from '@/components/ui/testimonials-grid';
import { Footer } from '@/components/ui/footer';
import VideoPlayer from '@/components/ui/video-player';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar - Glassmorphism */}
      <GlassmorphismNavbar />

      {/* Hero Section - Glassmorphism */}
      <GlassmorphismHero />

      {/* Feature Bento Grid - Replaces Problem & Solution Sections */}
      <FeatureBentoGrid />

      {/* How It Works - Spotlight Cards */}
      <HowItWorksSpotlight />

      {/* Testimonials Grid */}
      <TestimonialsGrid />

      {/* Video Showcase Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-4">
              See OpenGuild{" "}
              <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
                In Action
              </span>
            </h2>
            <p className="text-xl text-text-secondary">
              Watch how builders are shipping products and earning reputation
            </p>
          </div>

          {/* Video Player */}
          <div className="mb-12">
            <VideoPlayer src="https://videos.pexels.com/video-files/30333849/13003128_2560_1440_25fps.mp4" />
          </div>

        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">
            Ready to Build Your{" "}
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
              Future?
            </span>
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join 10,000+ builders shipping products earning reputation, and unlocking opportunities.
          </p>

          <AnimatedButton href="/signup" variant="primary" className="mb-8">
            Join the Guild - It's Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </AnimatedButton>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✅</span>
              Free forever for builders
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✅</span>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✅</span>
              10,000+ verified users
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<Sparkles className="w-8 h-8 text-accent-cyan" />}
        brandName="OpenGuild"
        socialLinks={[
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com/openguild",
            label: "Twitter",
          },
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com/openguild",
            label: "GitHub",
          },
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: "https://linkedin.com/company/openguild",
            label: "LinkedIn",
          },
        ]}
        mainLinks={[
          { href: "/projects", label: "Projects" },
          { href: "/hackathons", label: "Hackathons" },
          { href: "/matching", label: "Matching" },
          { href: "/tokens", label: "Tokens" },
          { href: "/reputation", label: "Reputation" },
          { href: "/about", label: "About" },
          { href: "/blog", label: "Blog" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/security", label: "Security" },
        ]}
        copyright={{
          text: "©2026 OpenGuild",
          license: "Where Builders Become Legends",
        }}
      />
    </div>
  );
}
