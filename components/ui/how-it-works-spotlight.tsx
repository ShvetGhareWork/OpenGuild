"use client";

import { GlowCard } from "@/components/ui/spotlight-card";
import { Shield, Users, TrendingUp } from "lucide-react";

interface StepData {
  step: string;
  title: string;
  icon: React.ElementType;
  points: string[];
  color: 'cyan' | 'purple' | 'blue';
}

const stepsData: StepData[] = [
  {
    step: "01",
    title: "Join & Verify",
    icon: Shield,
    color: "cyan",
    points: [
      "🔐 Sign up with email or Google",
      "🔗 Connect GitHub, LeetCode, Behance",
      "✅ AI verifies your skills automatically",
    ],
  },
  {
    step: "02",
    title: "Build & Earn",
    icon: Users,
    color: "purple",
    points: [
      "💡 Browse projects or post your own idea",
      "👥 Form a team with matched builders",
      "🚀 Ship milestones and earn reputation",
    ],
  },
  {
    step: "03",
    title: "Get Discovered",
    icon: TrendingUp,
    color: "blue",
    points: [
      "📈 Reputation unlocks opportunities",
      "💼 Recruiters find you based on real work",
      "🎯 Get hired or funded transparently",
    ],
  },
];

export default function HowItWorksSpotlight() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-medium text-center mb-4">
          From Zero to Hired in{" "}
          <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
            3 Steps
          </span>
        </h2>
        <p className="text-xl text-text-secondary text-center mb-16 max-w-3xl mx-auto">
          Move your cursor to see the magic ✨
        </p>

        <div className="flex gap-8 flex-wrap justify-center items-center">
          {stepsData.map((step) => {
            const Icon = step.icon;
            return (
              <GlowCard
                key={step.step}
                glowColor={step.color}
                customSize
                width={350}
                height={450}
                className="!bg-bg-tertiary/50"
              >
                <div className="flex flex-col h-full justify-between p-4">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-accent-cyan/20 mb-4">
                    {step.step}
                  </div>

                  {/* Icon and Title */}
                  <div className="flex-1 flex flex-col justify-center">
                    <Icon className="w-16 h-16 text-accent-cyan mb-6" />
                    <h3 className="text-2xl font-semibold mb-6 text-text-primary">
                      {step.title}
                    </h3>

                    {/* Points */}
                    <ul className="space-y-3">
                      {step.points.map((point, index) => (
                        <li
                          key={index}
                          className="text-base text-text-secondary leading-relaxed"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                 
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
