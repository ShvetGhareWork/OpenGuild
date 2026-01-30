'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, Users, Eye, ArrowUpCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { getProjects } from '@/lib/dummyProjects';
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedButton } from '@/components/ui/animated-button';

export default function ProjectsPage() {
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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.sort) params.append('sort', filter.sort);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:5000/api/projects?${params}`, {
        headers,
      });
      const data = await res.json();

      if (data.success) {
        // Only show real projects from MongoDB
        // Each user should only see their own projects + public projects
        const realProjects = data.data.projects || [];
        setProjects(realProjects);
      } else {
        // If API returns error, use dummy data as fallback
        const dummyData = getProjects({
          status: filter.status,
          sort: filter.sort,
          search: filter.search,
        });
        setProjects(dummyData.projects);
      }
      setLoading(false);
    } catch (err) {
      console.error('API Error, using dummy data:', err);
      // Use dummy data when API is unavailable
      const dummyData = getProjects({
        status: filter.status,
        sort: filter.sort,
        search: filter.search,
      });
      setProjects(dummyData.projects);
      setLoading(false);
    }
  };

  const handleUpvote = async (projectId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to upvote');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}/upvote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setProjects(projects.map(p =>
          p._id === projectId
            ? { ...p, upvotes: data.data.upvotes }
            : p
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#00d4ff"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-2xl font-regular font-bold">
               OpenGuild
              </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/projects" className="text-text-primary font-medium">
              Projects
            </Link>
            <AnimatedButton href="/projects/create" variant="primary" className="text-sm px-4 py-2">
              Create Project
            </AnimatedButton>
          </div>
        </div>
      </nav>

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
