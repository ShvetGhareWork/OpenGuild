'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function MatchingPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/matching/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setMatches(data.data.matches);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-purple-400';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse font-bold">
          Finding your perfect matches...
        </div>
      </div>
    );
  }

  return (
    <MainLayout gridColor="#3b82f6">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            AI-Powered <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Project Matches</span>
          </h1>
          <p className="text-xl text-gray-400">
            Projects perfectly matched to your skills, goals, and experience
          </p>
        </div>

        {/* Matches */}
        {matches.length === 0 ? (
          <Card glass className="p-16 text-center border-white/10 bg-white/5">
            <Target className="w-20 h-20 text-cyan-400 mx-auto mb-6 opacity-50" />
            <p className="text-xl text-white font-bold mb-2">No matches found</p>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Complete your onboarding and add more skills to help our AI find the best builders for you.
            </p>
            <Link href="/profile">
              <Button className="bg-cyan-600 hover:bg-cyan-500 px-8 py-6 rounded-2xl font-bold">Update Profile</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {matches.map((match, i) => (
              <Card key={match.project._id} glass className="p-8 border-white/10 bg-white/5 hover:border-cyan-500/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Zap className="w-32 h-32 text-cyan-400 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  {/* Match Score */}
                  <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 rounded-3xl min-w-[120px]">
                    <div className={`text-5xl font-black mb-1 ${getScoreColor(match.matchScore)}`}>
                      {match.matchScore}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Compatibility</div>
                    <Badge className="mt-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black">
                      #{i + 1} BEST MATCH
                    </Badge>
                  </div>

                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <Link href={`/projects/${match.project._id}`}>
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                            {match.project.name}
                          </h3>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 max-w-2xl">{match.project.description}</p>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {match.project.techStack?.slice(0, 6).map((tech: string, j: number) => (
                        <Badge key={j} className="bg-white/5 text-gray-400 border-white/10 text-[10px] font-bold py-1 px-3">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Match Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-black/60 rounded-3xl border border-white/5">
                      {[
                        { label: 'Skills', val: match.breakdown.skillCompatibility, icon: Zap, col: 'text-cyan-400' },
                        { label: 'Goals', val: match.breakdown.goalAlignment, icon: Target, col: 'text-purple-400' },
                        { label: 'Reputation', val: match.breakdown.reputationCompatibility, icon: TrendingUp, col: 'text-emerald-400' },
                        { label: 'Activity', val: match.breakdown.activityScore, icon: Sparkles, col: 'text-pink-400' },
                        { label: 'Diversity', val: match.breakdown.diversityScore, icon: Users, col: 'text-blue-400' },
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center group/stat">
                          <div className="flex items-center justify-center gap-1.5 mb-2">
                            <stat.icon className={`w-3.5 h-3.5 ${stat.col} opacity-50 group-hover/stat:opacity-100 transition-opacity`} />
                            <span className="text-sm font-black text-white">
                              {stat.val}%
                            </span>
                          </div>
                          <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <div className="mt-8 flex items-center gap-4">
                      <Link href={`/projects/${match.project._id}`}>
                        <Button className="bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold px-6">View Project Details</Button>
                      </Link>
                      <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest pl-2">Save for later</button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
