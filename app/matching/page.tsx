'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
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
    if (score >= 80) return 'text-accent-green';
    if (score >= 60) return 'text-accent-cyan';
    if (score >= 40) return 'text-accent-violet';
    return 'text-text-secondary';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl gradient-text animate-pulse">Finding your perfect matches...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#3b82f6"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-4xl font-regular font-medium">
               OpenGuild
              </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/matching" className="text-text-primary font-medium">
              AI Matching
            </Link>
            <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors">
              Projects
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            AI-Powered <span className="">Project Matches</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Projects perfectly matched to your skills, goals, and experience
          </p>
        </div>

        {/* Matches */}
        {matches.length === 0 ? (
          <Card glass className="p-12 text-center">
            <Target className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
            <p className="text-xl text-text-secondary mb-4">No matches found</p>
            <p className="text-sm text-text-tertiary mb-6">
              Complete your onboarding and add skills to get personalized recommendations
            </p>
            <Link href="/onboarding">
              <Button>Complete Onboarding</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches.map((match, i) => (
              <Card key={match.project._id} glass hover className="p-6">
                <div className="flex items-start gap-6">
                  {/* Match Score */}
                  <div className="text-center flex-shrink-0">
                    <div className={`text-5xl font-bold mb-2 ${getScoreColor(match.matchScore)}`}>
                      {match.matchScore}
                    </div>
                    <div className="text-xs text-text-tertiary">Match Score</div>
                    <Badge variant="verified" className="mt-2">
                      #{i + 1} Match
                    </Badge>
                  </div>

                  {/* Project Info */}
                  <div className="flex-1">
                    <Link href={`/projects/${match.project._id}`}>
                      <h3 className="text-2xl font-semibold mb-2 hover:text-accent-cyan transition-colors cursor-pointer">
                        {match.project.name}
                      </h3>
                    </Link>
                    <p className="text-text-secondary mb-4">{match.project.description}</p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.project.techStack?.slice(0, 5).map((tech: string, j: number) => (
                        <Badge key={j} variant="tech" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Match Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 glass rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="w-4 h-4 text-accent-cyan" />
                          <span className="text-sm font-semibold">
                            {match.breakdown.skillCompatibility}%
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary">Skills</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-accent-violet" />
                          <span className="text-sm font-semibold">
                            {match.breakdown.goalAlignment}%
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary">Goals</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-4 h-4 text-accent-green" />
                          <span className="text-sm font-semibold">
                            {match.breakdown.reputationCompatibility}%
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary">Reputation</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Sparkles className="w-4 h-4 text-accent-pink" />
                          <span className="text-sm font-semibold">
                            {match.breakdown.activityScore}%
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary">Activity</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-accent-blue" />
                          <span className="text-sm font-semibold">
                            {match.breakdown.diversityScore}%
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary">Diversity</div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4">
                      <Link href={`/projects/${match.project._id}`}>
                        <Button>View Project Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
