'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  Trophy,
  Code2,
  Users,
  Rocket,
  TrendingUp,
  Calendar,
  Target,
  Award,
  LogOut,
  User as UserIcon,
  Bell,
  Search,
  Plus,
  ArrowRight,
  Star,
  GitBranch,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user data
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await userRes.json();

        if (!userData.success) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          router.push('/login');
          return;
        }

        setUser(userData.data);

        // Fetch user's projects
        const projectsRes = await fetch('http://localhost:5000/api/projects?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setProjects(projectsData.data.projects || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.username || 'Builder';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navbar */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-xl sm:text-2xl font-bold">
              OpenGuild
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
            <Link href="/dashboard" className="text-white font-medium text-sm sm:text-base hover:text-cyan-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/projects" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base hover:text-purple-400">
              Projects
            </Link>
            <Link href="/reputation" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base hover:text-pink-400">
              Reputation
            </Link>
            <Link href="/tokens" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base hover:text-yellow-400">
              Tokens
            </Link>
            <Link href="/matching" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base hover:text-green-400">
              Matching
            </Link>
            <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base hover:text-blue-400">
              Profile
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Welcome Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 text-white">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {displayName}
            </span>
            ! 👋
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Here's what's happening in your guild today
          </p>
        </div>

        {/* Bento Box Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Large Profile Card */}
          <div
            className="lg:col-span-2 lg:row-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:scale-[1.02] hover:border-white/20 transition-all cursor-pointer"
            onClick={() => router.push('/profile')}
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-cyan-400 text-sm font-medium mb-6 uppercase tracking-wider">Profile</h2>
              <div className="flex items-center gap-4 mb-6">
                {user?.avatar ? (
                  <img
                    src={`http://localhost:5000${user.avatar}`}
                    alt={displayName}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xl font-bold text-white">{displayName}</div>
                  <div className="text-sm text-gray-400">@{user?.username || 'username'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {user?.reputationScore ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {user?.skills?.length ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Skills</div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Project Card */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-purple-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/projects/create')}
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
              <Sparkles className="w-16 h-16 text-purple-300 mb-4 opacity-90" />
              <h3 className="text-white font-bold text-lg">New Project</h3>
              <p className="text-gray-300 text-sm mt-2">Start building</p>
            </div>
          </div>

          {/* To Do Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-white/20 transition-all">
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-40"></div>
            <div className="relative z-10">
              <h2 className="text-yellow-400 text-xs font-medium mb-4 uppercase tracking-wider">To Do</h2>
              <div className="space-y-3">
                {[
                  'Complete profile',
                  'Join a project',
                  'Verify skills',
                  'Earn tokens',
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="text-sm text-gray-200">{task}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Projects Card */}
          <div
            className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-emerald-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/projects')}
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-emerald-400 text-xs font-medium mb-6 uppercase tracking-wider">Recent Projects</h2>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.slice(0, 2).map((project: any) => (
                    <div
                      key={project._id}
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all"
                    >
                      <h3 className="text-white font-semibold text-sm mb-1">{project.name || project.title}</h3>
                      <p className="text-gray-300 text-xs line-clamp-1">{project.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Rocket className="w-12 h-12 text-emerald-300 mx-auto mb-3 opacity-70" />
                  <p className="text-gray-300 text-sm">No projects yet</p>
                  <p className="text-gray-500 text-xs mt-1">Create your first project</p>
                </div>
              )}
            </div>
          </div>

          {/* Tokens Card */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-yellow-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/tokens')}
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
              <Zap className="w-14 h-14 text-yellow-400 mb-4 opacity-90" />
              <div className="text-3xl font-bold text-white mb-2">{user?.tokenBalance ?? 0}</div>
              <div className="text-xs text-gray-300 uppercase tracking-wider">Skill Tokens</div>
            </div>
          </div>

          {/* Team Matching Card */}
          <div
            className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-3xl p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-blue-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/matching')}
          >
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-blue-400 text-xs font-medium mb-6 uppercase tracking-wider">Find Team</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">AI Matching</p>
                  <p className="text-gray-400 text-sm">Find perfect teammates</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 border-0"
              >
                Start Matching
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => router.push('/projects')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Search className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-base mb-1">Browse</h3>
            <p className="text-gray-400 text-sm">Explore projects</p>
          </button>

          <button
            onClick={() => router.push('/reputation')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Trophy className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-base mb-1">Reputation</h3>
            <p className="text-gray-400 text-sm">View ranking</p>
          </button>

          <button
            onClick={() => router.push('/hackathons')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Calendar className="w-10 h-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-base mb-1">Hackathons</h3>
            <p className="text-gray-400 text-sm">Join events</p>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Award className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-white font-semibold text-base mb-1">Achievements</h3>
            <p className="text-gray-400 text-sm">View badges</p>
          </button>
        </div>
      </main>
    </div>
  );
}
