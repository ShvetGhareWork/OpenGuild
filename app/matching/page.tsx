'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Target, TrendingUp, Users, Zap, LogOut, Code2, Trophy, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { API_URL } from '@/lib/api';

export default function MatchingPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* ================= NAVBAR ================= */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Header */}
          <div className="flex items-center justify-between py-4 lg:hidden">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-300 hover:text-white h-10 w-10 p-0"
            >
              ☰
            </Button>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden lg:flex items-center justify-between py-2">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>

            <div className="flex items-center gap-6">
              {['Dashboard', 'Projects', 'Reputation', 'Tokens', 'Matching', 'Profile'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}

              <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_id'); router.push('/'); }} className="text-gray-400 hover:text-white ml-4">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95
    border-r border-white/10 shadow-2xl backdrop-blur-xl transform transition-transform duration-300
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                OpenGuild
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-3 flex-1">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: <Target className="w-5 h-5" /> },
                { name: 'Projects', path: '/projects', icon: <Code2 className="w-5 h-5" /> },
                { name: 'Reputation', path: '/reputation', icon: <Trophy className="w-5 h-5" /> },
                { name: 'Tokens', path: '/tokens', icon: <Zap className="w-5 h-5" /> },
                { name: 'Matching', path: '/matching', icon: <Users className="w-5 h-5" /> },
                { name: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
              ].map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`group flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all
              ${isActive
                        ? 'bg-white/15 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span
                      className={`transition group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-gray-400'
                        }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_id'); router.push('/'); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>


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
