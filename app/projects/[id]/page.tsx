'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ArrowUpCircle, Eye, Users, Calendar, Target, Github, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/lib/dummyProjects';
import toast, { Toaster } from 'react-hot-toast';
import ProjectChat from '@/components/ProjectChat';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appliedRoles, setAppliedRoles] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
    // Fetch current user
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }
      }
    };
    fetchUser();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${params.id}`);
      const data = await res.json();

      if (data.success && data.data) {
        setProject(data.data);
      } else {
        // Try to get from dummy data
        const dummyProject = getProjectById(params.id as string);
        if (dummyProject) {
          setProject(dummyProject);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('API Error, checking dummy data:', err);
      // Try to get from dummy data when API fails
      const dummyProject = getProjectById(params.id as string);
      if (dummyProject) {
        setProject(dummyProject);
      }
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to upvote');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${params.id}/upvote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setProject({ ...project, upvotes: data.data.upvotes });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (roleId: string, roleName: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Please login to apply for this role');
      router.push('/login');
      return;
    }

    if (appliedRoles.has(roleId)) {
      toast.error('You have already applied for this role');
      return;
    }

    setApplying(true);

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleId,
          roleName,
          message: 'I would like to join your team!',
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Add to applied roles
        setAppliedRoles(prev => new Set(prev).add(roleId));
        
        // Show success notification
        toast.success(
          `Application submitted! The team will review your application for ${roleName}.`,
          { duration: 5000 }
        );
      } else {
        toast.error(data.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error submitting application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-lg text-text-secondary animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Card glass className="p-8 text-center max-w-md mx-4">
          <p className="text-lg text-text-secondary mb-4">Project not found</p>
          <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Toaster position="top-right" />
      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Back button (top) */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/projects')}
            className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>

        {/* Hero / Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge variant="status" className="text-sm px-3 py-1">
              {project.status}
            </Badge>
          </div>

          <p className="text-lg text-text-secondary max-w-3xl mb-6">{project.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary">
            <button
              onClick={handleUpvote}
              className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-accent-cyan hover:bg-white/5 transition-all"
            >
              <ArrowUpCircle className="w-5 h-5 text-accent-cyan" />
              <span className="font-medium">{project.upvotes || 0}</span>
            </button>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {project.views || 0}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {project.team?.length || 0}
            </div>
            
            {/* Chat Button - Only show for team members */}
            {user && (project.team?.some((m: any) => 
              m.userId?._id === user._id || m.userId === user._id
            ) || project.creatorId?._id === user._id || project.creatorId === user._id) && (
              <button
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-white/10 hover:border-accent-violet hover:bg-white/5 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-accent-violet" />
                <span className="font-medium">Team Chat</span>
              </button>
            )}
          </div>
        </header>

        {/* Grid: Main content + Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <main className="md:col-span-8 space-y-8">
            {/* Vision */}
            {project.vision && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-accent-cyan" />
                  <h2 className="text-xl font-semibold">Vision</h2>
                </div>
                <Card glass className="p-6">
                  <p className="text-text-secondary leading-relaxed">{project.vision}</p>
                </Card>
              </section>
            )}

            {/* Tech Stack */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech: string, i: number) => (
                  <Badge key={i} variant="tech" className="text-sm px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, i: number) => (
                    <Card
                      key={i}
                      glass
                      className={`p-5 border-l-4 ${milestone.completed ? 'border-accent-green' : 'border-accent-yellow'} ${
                        milestone.completed ? 'bg-accent-green/10' : 'bg-white/3'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        {milestone.completed ? (
                          <Badge variant="verified" className="text-xs px-2 py-0.5">
                            Done
                          </Badge>
                        ) : (
                          <span className="text-xs text-text-tertiary">Upcoming</span>
                        )}
                      </div>

                      <p className="text-sm text-text-secondary mt-2 mb-2">
                        {milestone.description}
                      </p>

                      {milestone.deadline && (
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <Calendar className="w-4 h-4" />
                          {new Date(milestone.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="md:col-span-4 space-y-6">
            {/* Creator */}
            <Card glass className="p-6">
              <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">
                Project Lead
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium">
                  {project.creatorId?.displayName?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-sm">{project.creatorId?.displayName}</div>
                  <div className="text-xs text-text-tertiary">@{project.creatorId?.username}</div>
                </div>
              </div>

              {project.creatorId?.reputationScore !== undefined && (
                <div className="flex items-center justify-between p-3 glass rounded-lg text-sm">
                  <span className="text-text-tertiary">Reputation</span>
                  <span className="font-medium text-accent-cyan">
                    {project.creatorId.reputationScore}
                  </span>
                </div>
              )}
            </Card>

            {/* Team */}
            {project.team && project.team.length > 0 && (
              <Card glass className="p-6">
                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">
                  Team ({project.team.length})
                </h3>
                <div className="space-y-3">
                  {project.team.map((member: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-medium">
                        {member.userId?.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm">{member.userId?.displayName}</div>
                        <div className="text-xs text-text-tertiary capitalize">
                          {member.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Open Roles */}
            {project.openRoles && project.openRoles.filter((r: any) => !r.filled).length > 0 && (
              <Card glass className="p-6">
                <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">
                  Open Roles
                </h3>
                <div className="space-y-5">
                  {project.openRoles
                    .filter((role: any) => !role.filled)
                    .map((role: any, i: number) => (
                      <div key={i} className="p-4 glass rounded-lg">
                        <h4 className="font-medium text-sm">{role.role}</h4>
                        <p className="text-xs text-text-secondary mt-1 mb-3">
                          {role.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {role.skills?.map((skill: string, j: number) => (
                            <Badge key={j} variant="skill" className="text-xs px-1.5 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full text-sm"
                          onClick={() => handleApply(role.role, role.role)}
                          disabled={applying || appliedRoles.has(role.role)}
                        >
                          {applying ? 'Applying...' : appliedRoles.has(role.role) ? '✓ Applied' : `Apply for ${role.role}`}
                        </Button>
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* CTA */}
            <Card glass className="p-6 text-center">
              <h3 className="font-medium text-sm mb-1">Ready to join?</h3>
              <p className="text-xs text-text-tertiary mb-4">Apply to become part of the team.</p>
              <Button 
                size="sm" 
                className="w-full text-sm"
                onClick={() => {
                  const firstOpenRole = project.openRoles?.find((r: any) => !r.filled);
                  if (firstOpenRole) {
                    handleApply(firstOpenRole.role, firstOpenRole.role);
                  } else {
                    toast.error('No open roles available');
                  }
                }}
                disabled={applying}
              >
                {applying ? 'Applying...' : 'Apply Now'}
              </Button>
            </Card>
          </aside>
        </div>
      </div>

      {/* Navbar (sticky) */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-2xl font-regular font-bold">
               OpenGuild
              </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/projects" className="text-sm text-text-primary font-medium">
              Projects
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Project Chat */}
      {showChat && user && (
        <ProjectChat
          projectId={params.id as string}
          userId={user._id}
          userName={user.displayName || user.username}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
