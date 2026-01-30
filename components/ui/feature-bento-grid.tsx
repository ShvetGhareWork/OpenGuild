import { Code2, Users, Sparkles, Trophy, Target, Zap, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

function FeatureBentoGrid() {
  return (
    <div className="w-full py-20 lg:py-38">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex gap-4 flex-col items-start">
            <div>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-6xl tracking-tighter max-w-xl font-display text-left">
                OpenGuild: Where Builders Become{" "}
              <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
                Legends
              </span>         
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-text-secondary text-left">
                A skill-verified ecosystem where your work speaks louder than your resume
              </p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Large Card - Project Marketplace */}
            <div className="glass rounded-2xl h-full lg:col-span-2 p-8 aspect-square lg:aspect-auto flex justify-between flex-col hover:bg-white/10 transition-all group">
              <Code2 className="w-12 h-12 stroke-1 text-accent-cyan group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl tracking-tight font-semibold">Project Marketplace</h3>
                <p className="text-text-secondary max-w-md text-base leading-relaxed">
                  Browse 500+ projects seeking talented builders. Filter by tech stack, role, and commitment level. Find your next big opportunity.
                </p>
              </div>
            </div>

            {/* Small Card - Reputation System */}
            <div className="glass rounded-2xl aspect-square p-8 flex justify-between flex-col hover:bg-white/10 transition-all group">
              <Sparkles className="w-12 h-12 stroke-1 text-accent-violet group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl tracking-tight font-semibold">Reputation System</h3>
                <p className="text-text-secondary max-w-xs text-base leading-relaxed">
                  Every contribution is AI-verified and adds to your reputation score. Your work becomes your credential.
                </p>
              </div>
            </div>

            {/* Small Card - Team Matching */}
            <div className="glass rounded-2xl aspect-square p-8 flex justify-between flex-col hover:bg-white/10 transition-all group">
              <Users className="w-12 h-12 stroke-1 text-accent-blue group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl tracking-tight font-semibold">Team Matching</h3>
                <p className="text-text-secondary max-w-xs text-base leading-relaxed">
                  AI matches you with compatible teammates based on skills, goals, and working style.
                </p>
              </div>
            </div>

            {/* Large Card - Skill Tokens */}
            <div className="glass rounded-2xl h-full lg:col-span-2 p-8 aspect-square lg:aspect-auto flex justify-between flex-col hover:bg-white/10 transition-all group">
              <Trophy className="w-12 h-12 stroke-1 text-accent-pink group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-3">
                <h3 className="text-2xl tracking-tight font-semibold">Skill Tokens</h3>
                <p className="text-text-secondary max-w-md text-base leading-relaxed">
                  Ship milestones, mentor builders, win hackathons. Spend tokens to unlock premium features and boost your profile.
                </p>
              </div>
            </div>
          </div>

           <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-6xl tracking-tighter max-w-xl font-display text-left">
                Talented Builders Face Real{"      "}
              <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
                Barriers
              </span>
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-text-secondary text-left">
                Traditional paths don't work for modern builders
              </p>
            </div>

          {/* Problem Cards - Below Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-semibold mb-2">No Real Projects</h3>
              <p className="text-sm text-text-secondary">
                Tutorials aren't enough. You need real projects with real teams.
              </p>
            </div>

            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold mb-2">Trust Deficit</h3>
              <p className="text-sm text-text-secondary">
                Building with strangers is risky. You need verified collaborators.
              </p>
            </div>

            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-lg font-semibold mb-2">Mentorship Void</h3>
              <p className="text-sm text-text-secondary">
                Learning alone is slow. You need expert mentors who care.
              </p>
            </div>

            <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2">Opportunity Gap</h3>
              <p className="text-sm text-text-secondary">
                Credentials aren't enough. You need proof of real impact.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FeatureBentoGrid };
