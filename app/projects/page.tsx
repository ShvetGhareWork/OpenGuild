'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  TrendingUp,
  Clock,
  Users,
  Eye,
  ArrowUpCircle,
  Sparkles,
  Code2,
  Trophy,
  Target,
  Zap,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { getProjects } from '@/lib/dummyProjects';
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedButton } from '@/components/ui/animated-button';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useProjectUpvotes } from '@/hooks/useSocket';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filter, setFilter] = useState({
    status: 'all',
    sort: 'recent',
    search: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  // Live upvotes — update count for whichever project was upvoted
  const handleLiveUpvote = useCallback((data: { projectId: string; upvotes: number }) => {
    setProjects(prev => prev.map(p => p._id === data.projectId ? { ...p, upvotes: data.upvotes } : p));
  }, []);
  useProjectUpvotes(handleLiveUpvote);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.sort) params.append('sort', filter.sort);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/projects?${params}`, {
        headers,
      });
      const data = await res.json();

      if (data.success) setProjects(data.data.projects || []);
      else setProjects(getProjects(filter).projects);
    } catch {
      setProjects(getProjects(filter).projects);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (projectId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('Please login');

    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/upvote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, upvotes: data.data.upvotes } : p))
        );
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <FlickeringGrid className="absolute inset-0 z-0" squareSize={4} gridGap={6} color="#00d4ff" />

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
              {['Dashboard', 'Projects', 'Reputation', 'Tokens', 'Matching', 'Profile'].map((item) => (
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

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                Project <span className="gradient-text">Marketplace</span>
              </h1>
              <p className="text-xl text-text-secondary">
                Discover exciting projects and join talented teams
              </p>
            </div>
            <Link href="/projects/create">
              <Button size="md" className="flex items-center gap-2">
                + Create Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card glass className="p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full glass border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                  placeholder="Search projects..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                selectedKey={filter.status}
                onSelectionChange={(key) => setFilter({ ...filter, status: key as string })}
                className="w-full"
              >
                <SelectTrigger className="w-full glass border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    <SelectItem id="all">All Status</SelectItem>
                    <SelectItem id="recruiting">Recruiting</SelectItem>
                    <SelectItem id="active">Active</SelectItem>
                    <SelectItem id="completed">Completed</SelectItem>
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Select
                selectedKey={filter.sort}
                onSelectionChange={(key) => setFilter({ ...filter, sort: key as string })}
                className="w-full"
              >
                <SelectTrigger className="w-full glass border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover>
                  <SelectListBox>
                    <SelectItem id="recent">Most Recent</SelectItem>
                    <SelectItem id="trending">Trending</SelectItem>
                    <SelectItem id="upvotes">Most Upvoted</SelectItem>
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl gradient-text animate-pulse">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <Card glass className="p-12 text-center">
            <p className="text-xl text-text-secondary mb-4">No projects found</p>
            <Button>Create First Project</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={project._id} glass hover className="flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/projects/${project._id}`}>
                      <h3 className="text-xl font-semibold mb-2 hover:text-accent-cyan transition-colors cursor-pointer">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <Badge variant="status">{project.status}</Badge>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                    <Badge key={i} variant="tech" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {project.techStack?.length > 3 && (
                    <Badge variant="tech" className="text-xs">
                      +{project.techStack.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold">
                    {project.creatorId?.displayName?.[0] || 'U'}
                  </div>
                  <span className="text-sm text-text-secondary">
                    by {project.creatorId?.displayName || 'Unknown'}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-text-tertiary mt-auto pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleUpvote(project._id)}
                    className="flex items-center gap-1 hover:text-accent-cyan transition-colors"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    {project.upvotes || 0}
                  </button>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {project.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.team?.length || 0}
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