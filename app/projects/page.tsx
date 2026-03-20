'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  ArrowUpCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { getProjects } from '@/lib/dummyProjects';
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useProjectUpvotes } from '@/hooks/useSocket';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <MainLayout gridColor="#00d4ff">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2 text-white">
                Project <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Marketplace</span>
              </h1>
              <p className="text-xl text-gray-400">
                Discover exciting projects and join talented teams
              </p>
            </div>
            <Link href="/projects/create">
              <Button size="md" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 border-0 hover:scale-105 transition-transform">
                + Create Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card glass className="p-6 mb-8 border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white"
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
                <SelectTrigger className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover className="bg-gray-900 border-white/10 backdrop-blur-xl">
                  <SelectListBox className="p-2">
                    <SelectItem id="all" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">All Status</SelectItem>
                    <SelectItem id="recruiting" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Recruiting</SelectItem>
                    <SelectItem id="active" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Active</SelectItem>
                    <SelectItem id="completed" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Completed</SelectItem>
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
                <SelectTrigger className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopover className="bg-gray-900 border-white/10 backdrop-blur-xl">
                  <SelectListBox className="p-2">
                    <SelectItem id="recent" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Most Recent</SelectItem>
                    <SelectItem id="trending" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Trending</SelectItem>
                    <SelectItem id="upvotes" className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg p-2">Most Upvoted</SelectItem>
                  </SelectListBox>
                </SelectPopover>
              </Select>
            </div>
          </div>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse font-bold">
              Loading projects...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <Card glass className="p-12 text-center border-white/10 bg-white/5">
            <p className="text-xl text-gray-400 mb-6 font-medium">No projects found matching your criteria</p>
            <Button onClick={() => setFilter({ status: 'all', sort: 'recent', search: '' })} variant="secondary">
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} glass hover className="flex flex-col border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all p-6 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project._id}`}>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors cursor-pointer truncate">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed h-10">
                      {project.description}
                    </p>
                  </div>
                  <Badge className={`ml-2 whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                    project.status === 'recruiting' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                    project.status === 'active' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {project.status}
                  </Badge>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/10 uppercase tracking-tighter">
                      {tech}
                    </span>
                  ))}
                  {project.techStack?.length > 3 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>

                {/* Creator */}
                <div className="flex items-center gap-3 mb-6 bg-black/20 p-2 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white/10">
                    {project.creatorId?.displayName?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Owner</p>
                    <p className="text-xs text-white font-medium truncate">
                      {project.creatorId?.displayName || 'Unknown Builder'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-auto pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleUpvote(project._id)}
                    className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors group/upvote"
                  >
                    <ArrowUpCircle className="w-4 h-4 group-hover/upvote:scale-110 transition-transform" />
                    <span className="text-gray-300">{project.upvotes || 0}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span className="text-gray-300">{project.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span className="text-gray-300">{project.team?.length || 0}</span>
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