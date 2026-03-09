'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Calendar, Trophy, ExternalLink, Github, LogOut, Code2, Target, Zap, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { API_URL } from '@/lib/api';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchHackathons();
  }, [filter]);

  const fetchHackathons = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`${API_URL}/hackathons${params}`);
      const data = await res.json();

      if (data.success) {
        setHackathons(data.data.hackathons);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent-blue/20 text-accent-blue';
      case 'active': return 'bg-accent-green/20 text-accent-green';
      case 'judging': return 'bg-accent-violet/20 text-accent-violet';
      case 'completed': return 'bg-text-tertiary/20 text-text-tertiary';
      default: return 'bg-bg-tertiary text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      <FlickeringGrid className="absolute inset-0 z-0" squareSize={4} gridGap={6} color="#00d4ff" />

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
              {['Dashboard', 'Projects', 'Hackathons', 'Reputation', 'Tokens', 'Matching', 'Profile'].map((item) => (
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
                { name: 'Hackathons', path: '/hackathons', icon: <Trophy className="w-5 h-5" /> },
                { name: 'Reputation', path: '/reputation', icon: <TrendingUp className="w-5 h-5" /> },
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="">Hackathons</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Compete, build, and win prizes with talented builders
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['all', 'upcoming', 'active', 'judging', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'ghost'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl gradient-text animate-pulse">Loading hackathons...</div>
          </div>
        ) : hackathons.length === 0 ? (
          <Card glass className="p-12 text-center">
            <Trophy className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
            <p className="text-xl text-text-secondary mb-4">No hackathons found</p>
            <p className="text-sm text-text-tertiary">Check back soon for upcoming events!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon, index) => (
              <Card key={hackathon._id} glass hover className="flex flex-col">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getStatusColor(hackathon.status)}>
                    {hackathon.status}
                  </Badge>
                  {hackathon.prizes && hackathon.prizes.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-accent-cyan">
                      <Trophy className="w-4 h-4" />
                      ${hackathon.prizes[0].amount}
                    </div>
                  )}
                </div>

                {/* Title */}
                <Link href={`/hackathons/${hackathon._id}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-accent-cyan transition-colors cursor-pointer">
                    {hackathon.name}
                  </h3>
                </Link>

                {/* Theme */}
                {hackathon.theme && (
                  <p className="text-sm text-text-secondary mb-4">{hackathon.theme}</p>
                )}

                {/* Description */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-1">
                  {hackathon.description}
                </p>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(hackathon.startDate).toLocaleDateString()} -{' '}
                  {new Date(hackathon.endDate).toLocaleDateString()}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Users className="w-4 h-4" />
                    {hackathon.participants?.length || 0} participants
                  </div>
                  <Link href={`/hackathons/${hackathon._id}`}>
                    <Button size="sm" variant="secondary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
