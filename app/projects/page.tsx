'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';

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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.sort) params.append('sort', filter.sort);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:5000/api/projects?${params}`, { headers });
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

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, upvotes: data.data.upvotes } : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      <FlickeringGrid className="absolute inset-0 z-0" squareSize={4} gridGap={6} color="#00d4ff" />

      {/* ================= NAVBAR ================= */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            OpenGuild
          </Link>


          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-300 text-2xl"
          >
            ☰
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-white">
              Dashboard
            </Link>
            <Link href="/projects" className="text-white font-semibold">
              Projects
            </Link>
            <Link href="/reputation" className="text-text-secondary hover:text-white">
              Reputation
            </Link>
            <Link href="/tokens" className="text-text-secondary hover:text-white">
              Tokens
            </Link>
            <Link href="/matching" className="text-text-secondary hover:text-white">
              Matching
            </Link>
            <Link href="/profile" className="text-text-secondary hover:text-white">
              Profile
            </Link>
            <AnimatedButton href="/projects/create" variant="primary">
              Create Project
            </AnimatedButton>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70" />

        <div
          className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900 via-black to-gray-900
          border-r border-white/10 backdrop-blur-xl shadow-2xl transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">OpenGuild</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 text-xl">
                ✕
              </button>
            </div>

            {[
              { name: 'Dashboard', path: '/dashboard', icon: <Target className="w-5 h-5" /> },
              { name: 'Projects', path: '/projects', icon: <Code2 className="w-5 h-5" /> },
              { name: 'Reputation', path: '/reputation', icon: <Trophy className="w-5 h-5" /> },
              { name: 'Tokens', path: '/tokens', icon: <Zap className="w-5 h-5" /> },
              { name: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
              >
                {item.icon}
                {item.name}
              </button>
            ))}

            <button
              onClick={() => router.push('/')}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            Project <span className="">Marketplace</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Discover exciting projects and join talented teams
          </p>
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
            {projects.map((project) => (
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
