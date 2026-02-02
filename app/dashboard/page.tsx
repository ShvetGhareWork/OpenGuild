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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userRes = await fetch('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = await userRes.json();
        if (!userData.success) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          router.push('/login');
          return;
        }

        setUser(userData.data);

        const projectsRes = await fetch('http://localhost:5000/api/projects?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const projectsData = await projectsRes.json();
        if (projectsData.success) setProjects(projectsData.data.projects || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-3xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.username || 'Builder';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">

      {/* ================= NAVBAR ================= */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
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
              {['Dashboard','Projects','Reputation','Tokens','Matching','Profile'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}

              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white ml-4">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
  className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
    mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
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
              ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span
                className={`transition group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-gray-400'
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
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  </div>
</div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Welcome Header - Responsive typography */}
        <div className="mb-6 sm:mb-8 lg:mb-12 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold mb-2 sm:mb-4 text-white leading-tight">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {displayName}
            </span>
            ! 👋
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto sm:mx-0">
            Here's what's happening in your guild today
          </p>
        </div>

        {/* Bento Box Grid - Perfect responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Large Profile Card */}
          <div
            className="sm:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden group hover:scale-[1.02] hover:border-white/20 transition-all cursor-pointer"
            onClick={() => router.push('/profile')}
          >
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-cyan-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6 uppercase tracking-wider">Profile</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 lg:mb-8">
                {user?.avatar ? (
                  <img
                    src={`http://localhost:5000${user.avatar}`}
                    alt={displayName}
                    className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full object-cover border-4 border-white/20 shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold shadow-lg flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{displayName}</div>
                  <div className="text-xs sm:text-sm text-gray-400">@{user?.username || 'username'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {user?.reputationScore ?? 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mt-1">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {user?.skills?.length ?? 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider mt-1">Skills</div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Project Card */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-purple-500/50 transition-all cursor-pointer h-full"
            onClick={() => router.push('/projects/create')}
          >
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-purple-300 mb-3 sm:mb-4 opacity-90" />
              <h3 className="text-white font-bold text-base sm:text-lg">New Project</h3>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">Start building</p>
            </div>
          </div>

          {/* To Do Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-white/20 transition-all h-full">
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-40"></div>
            <div className="relative z-10">
              <h2 className="text-yellow-400 text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">To Do</h2>
              <div className="space-y-2 sm:space-y-3">
                {[
                  'Complete profile',
                  'Join a project',
                  'Verify skills',
                  'Earn tokens',
                ].map((task, i) => (
                  <div key={i} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
                    <div className="text-xs sm:text-sm text-gray-200 leading-tight">{task}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Projects Card */}
          <div
            className="sm:col-span-2 lg:col-span-3 xl:col-span-2 backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-emerald-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/projects')}
          >
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-emerald-400 text-xs font-medium mb-4 sm:mb-6 uppercase tracking-wider">Recent Projects</h2>
              {projects.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {projects.slice(0, 2).map((project: any) => (
                    <div
                      key={project._id}
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{project.name || project.title}</h3>
                      <p className="text-gray-300 text-xs line-clamp-1 sm:line-clamp-2">{project.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-300 mx-auto mb-3 opacity-70" />
                  <p className="text-gray-300 text-sm">No projects yet</p>
                  <p className="text-gray-500 text-xs mt-1">Create your first project</p>
                </div>
              )}
            </div>
          </div>

          {/* Tokens Card */}
          <div
            className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-yellow-500/50 transition-all cursor-pointer h-full"
            onClick={() => router.push('/tokens')}
          >
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-60"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
              <Zap className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-400 mb-3 sm:mb-4 opacity-90" />
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{user?.tokenBalance ?? 0}</div>
              <div className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider">Skill Tokens</div>
            </div>
          </div>

          {/* Team Matching Card */}
          <div
            className="sm:col-span-2 lg:col-span-3 xl:col-span-2 backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden group hover:scale-[1.02] hover:border-blue-500/50 transition-all cursor-pointer"
            onClick={() => router.push('/matching')}
          >
            <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-blue-400 text-xs font-medium mb-4 sm:mb-6 uppercase tracking-wider">Find Team</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 lg:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-base sm:text-lg lg:text-xl">AI Matching</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Find perfect teammates</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 border-0 px-6"
              >
                Start Matching
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Row - Perfect responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <button
            onClick={() => router.push('/projects')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all h-full flex flex-col items-center sm:items-start text-center sm:text-left"
          >
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Browse</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Explore projects</p>
          </button>

          <button
            onClick={() => router.push('/reputation')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all h-full flex flex-col items-center sm:items-start text-center sm:text-left"
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Reputation</h3>
            <p className="text-gray-400 text-xs sm:text-sm">View ranking</p>
          </button>

          <button
            onClick={() => router.push('/hackathons')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all h-full flex flex-col items-center sm:items-start text-center sm:text-left"
          >
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Hackathons</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Join events</p>
          </button>

          <button
            onClick={() => router.push('/profile')}
            className="backdrop-blur-xl group bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 transition-all h-full flex flex-col items-center sm:items-start text-center sm:text-left"
          >
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform mx-auto sm:mx-0" />
            <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Achievements</h3>
            <p className="text-gray-400 text-xs sm:text-sm">View badges</p>
          </button>
        </div>
      </main>
    </div>
  );
}
