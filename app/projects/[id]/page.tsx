'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  ArrowUpCircle,
  Eye,
  Users,
  Calendar,
  Target,
  MessageCircle,
  Bell,
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/lib/dummyProjects';
import toast, { Toaster } from 'react-hot-toast';
import ProjectChat from '@/components/ProjectChat';
import { API_URL } from '@/lib/api';
import { useProjectUpvotes, useMilestoneUpdates } from '@/hooks/useSocket';
import { io as socketIO } from 'socket.io-client';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveNotification {
  _id: string;
  type: string;
  projectName: string;
  applicantId: string;
  applicantName: string;
  applicantUsername: string;
  applicantAvatar: string;
  applicantReputation: number;
  applicantSkills: string[];
  roleName: string;
  message: string;
  applicationId: string;
  projectId: string;
  read: boolean;
  createdAt: string;
}

// ─── Notification Sound ───────────────────────────────────────────────────────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.warn('Audio not available', err);
  }
}

// ─── Applicant Profile Modal ──────────────────────────────────────────────────
function ApplicantProfileModal({
  notif,
  onAccept,
  onReject,
  onClose,
}: {
  notif: LiveNotification;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md glass border border-white/10 rounded-2xl shadow-2xl p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-1">Role Application</h2>
        <p className="text-xs text-gray-400 mb-5">
          Applied for <span className="text-cyan-400 font-medium">{notif.roleName}</span> in{' '}
          <span className="text-white">{notif.projectName}</span>
        </p>

        {/* Applicant card */}
        <div className="flex items-center gap-4 p-4 glass rounded-xl border border-white/10 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden">
            {notif.applicantAvatar ? (
              <img
                src={notif.applicantAvatar}
                alt={notif.applicantName}
                className="w-full h-full object-cover"
              />
            ) : (
              notif.applicantName?.[0]?.toUpperCase() || '?'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base">{notif.applicantName}</div>
            {notif.applicantUsername && (
              <div className="text-xs text-gray-400">@{notif.applicantUsername}</div>
            )}
            {notif.applicantReputation > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-cyan-400">
                <Star className="w-3 h-3" />
                {notif.applicantReputation} reputation
              </div>
            )}
          </div>

          {/* Full profile link */}
          <Link
            href={`/profile/${notif.applicantUsername || notif.applicantId}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Profile
          </Link>
        </div>

        {/* Skills */}
        {notif.applicantSkills && notif.applicantSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {notif.applicantSkills.slice(0, 8).map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {notif.message && (
          <div className="mb-5 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Message</p>
            <p className="text-sm text-gray-200 italic">"{notif.message}"</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30 transition font-medium text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition font-medium text-sm"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Toast Banner ────────────────────────────────────────────────
function NotificationBanner({
  notif,
  onViewProfile,
  onDismiss,
}: {
  notif: LiveNotification;
  onViewProfile: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-[150] w-80 glass border border-cyan-500/30 rounded-2xl shadow-2xl p-4 animate-slide-in">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
          {notif.applicantAvatar ? (
            <img src={notif.applicantAvatar} alt={notif.applicantName} className="w-full h-full object-cover" />
          ) : (
            notif.applicantName?.[0]?.toUpperCase() || '?'
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-medium">New Application</span>
          </div>
          <p className="text-sm font-semibold truncate">{notif.applicantName}</p>
          <p className="text-xs text-gray-400 truncate">
            applied for <span className="text-white">{notif.roleName}</span>
          </p>
        </div>

        <button onClick={onDismiss} className="text-gray-500 hover:text-white transition flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onViewProfile}
        className="mt-3 w-full text-xs py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition font-medium"
      >
        View Profile &amp; Respond →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appliedRoles, setAppliedRoles] = useState<Set<string>>(new Set());
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Notification state
  const [liveNotif, setLiveNotif] = useState<LiveNotification | null>(null);
  const [profileModalNotif, setProfileModalNotif] = useState<LiveNotification | null>(null);
  const socketRef = useRef<any>(null);

  // ── Fetch current user ──────────────────────────────────────────────────────
  useEffect(() => {
    if (params.id) fetchProject();

    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [params.id]);

  // ── Socket: live notifications for creator ──────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    const socket = socketIO(wsUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user', { userId: user._id });
    });

    socket.on('notification', (notif: LiveNotification) => {
      if (notif.type === 'application_received') {
        playNotificationSound();
        setLiveNotif(notif);
      } else if (
        notif.type === 'application_accepted' ||
        notif.type === 'application_rejected'
      ) {
        const isAccepted = notif.type === 'application_accepted';
        toast[isAccepted ? 'success' : 'error'](notif.message, { duration: 6000 });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // ── Live upvotes ────────────────────────────────────────────────────────────
  const handleLiveUpvote = useCallback(
    (data: { projectId: string; upvotes: number }) => {
      if (data.projectId === params.id)
        setProject((p: any) => (p ? { ...p, upvotes: data.upvotes } : p));
    },
    [params.id]
  );
  useProjectUpvotes(handleLiveUpvote);

  // ── Live milestones ─────────────────────────────────────────────────────────
  const handleMilestone = useCallback(
    (data: any) => {
      if (data.projectId === params.id) {
        setProject((p: any) => {
          if (!p) return p;
          const milestones = p.milestones.map((m: any) =>
            m._id === data.milestone._id ? data.milestone : m
          );
          return { ...p, milestones };
        });
      }
    },
    [params.id]
  );
  useMilestoneUpdates(params.id as string, handleMilestone);

  // ── Fetch project ───────────────────────────────────────────────────────────
  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setProject(data.data);
      } else {
        const dummy = getProjectById(params.id as string);
        if (dummy) setProject(dummy);
      }
    } catch {
      const dummy = getProjectById(params.id as string);
      if (dummy) setProject(dummy);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isCreator =
    user &&
    project &&
    (project.creatorId?._id === user._id || project.creatorId === user._id);

  const isTeamMember =
    user &&
    project &&
    (project.team?.some(
      (m: any) => m.userId?._id === user._id || m.userId === user._id
    ) || isCreator);

  // ── Upvote ──────────────────────────────────────────────────────────────────
  const handleUpvote = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { alert('Please login to upvote'); return; }
    try {
      const res = await fetch(`${API_URL}/projects/${params.id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProject({ ...project, upvotes: data.data.upvotes });
    } catch (err) { console.error(err); }
  };

  // ── Apply ───────────────────────────────────────────────────────────────────
  const handleApply = async (roleId: string, roleName: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Please login to apply'); router.push('/login'); return; }
    if (isCreator) { toast.error("You can't apply to your own project"); return; }
    if (appliedRoles.has(roleId)) { toast.error('You have already applied for this role'); return; }

    setApplying(true);
    try {
      const res = await fetch(`${API_URL}/projects/${params.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleId, roleName, message: 'I would like to join your team!' }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedRoles((prev) => new Set(prev).add(roleId));
        toast.success(`Application submitted for ${roleName}!`, { duration: 5000 });
      } else {
        toast.error(data.message || 'Failed to submit application');
      }
    } catch {
      toast.error('Error submitting application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // ── Accept / Reject application ─────────────────────────────────────────────
  // In app/projects/[id]/page.tsx
  // Replace your handleApplicationAction function with this:

  const handleApplicationAction = async (
    notif: LiveNotification,
    action: 'accept' | 'reject'
  ) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Force both IDs to plain strings — MongoDB ObjectIds can arrive as objects
    const projectId = typeof notif.projectId === 'object'
      ? (notif.projectId as any)._id || String(notif.projectId)
      : notif.projectId;

    const applicationId = typeof notif.applicationId === 'object'
      ? (notif.applicationId as any)._id || String(notif.applicationId)
      : notif.applicationId;

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          action === 'accept'
            ? `${notif.applicantName} accepted for ${notif.roleName}! 🎉`
            : `Application from ${notif.applicantName} rejected.`
        );
        setProfileModalNotif(null);
        setLiveNotif(null);
        fetchProject();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  // ── Loading / 404 ────────────────────────────────────────────────────────────
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

      {/* ── Live notification banner (for creator) ── */}
      {liveNotif && isCreator && (
        <NotificationBanner
          notif={liveNotif}
          onViewProfile={() => {
            setProfileModalNotif(liveNotif);
            setLiveNotif(null);
          }}
          onDismiss={() => setLiveNotif(null)}
        />
      )}

      {/* ── Applicant profile + accept/reject modal ── */}
      {profileModalNotif && isCreator && (
        <ApplicantProfileModal
          notif={profileModalNotif}
          onAccept={() => handleApplicationAction(profileModalNotif, 'accept')}
          onReject={() => handleApplicationAction(profileModalNotif, 'reject')}
          onClose={() => setProfileModalNotif(null)}
        />
      )}

      {/* ── Navbar ── */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-2xl font-bold">
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

      {/* ── Page body ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Back */}
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

        {/* Hero */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="status" className="text-sm px-3 py-1">{project.status}</Badge>
            {isCreator && (
              <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                Your Project
              </span>
            )}
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
              <Eye className="w-4 h-4" /> {project.views || 0}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" /> {project.team?.length || 0}
            </div>

            {isTeamMember && (
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main */}
          <main className="md:col-span-8 space-y-8">
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

            <section>
              <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech: string, i: number) => (
                  <Badge key={i} variant="tech" className="text-sm px-3 py-1">{tech}</Badge>
                ))}
              </div>
            </section>

            {project.milestones?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, i: number) => {
                    const toggleMilestone = async () => {
                      const token = localStorage.getItem('auth_token');
                      if (!token || !isTeamMember) return;
                      await fetch(
                        `${API_URL}/projects/${params.id}/milestones/${milestone._id}`,
                        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
                      );
                    };

                    return (
                      <Card
                        key={i}
                        glass
                        className={`p-5 border-l-4 ${milestone.completed ? 'border-accent-green bg-accent-green/10' : 'border-accent-yellow bg-white/3'}`}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{milestone.title}</h3>
                          <div className="flex items-center gap-2">
                            {isTeamMember ? (
                              <button
                                onClick={toggleMilestone}
                                className={`text-xs px-2 py-1 rounded-md border transition-all ${milestone.completed
                                  ? 'border-accent-green/40 text-accent-green hover:bg-accent-green/10'
                                  : 'border-white/20 text-text-tertiary hover:border-accent-cyan hover:text-accent-cyan'
                                  }`}
                              >
                                {milestone.completed ? '✓ Done' : 'Mark Done'}
                              </button>
                            ) : milestone.completed ? (
                              <Badge variant="verified" className="text-xs px-2 py-0.5">Done</Badge>
                            ) : (
                              <span className="text-xs text-text-tertiary">Upcoming</span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary mt-2 mb-2">{milestone.description}</p>
                        {milestone.deadline && (
                          <div className="flex items-center gap-2 text-xs text-text-tertiary">
                            <Calendar className="w-4 h-4" />
                            {new Date(milestone.deadline).toLocaleDateString()}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6">
            {/* Project Lead */}
            <Card glass className="p-6">
              <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-4">
                Project Lead
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-medium">
                  {project.creatorId?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-medium text-sm">{project.creatorId?.displayName}</div>
                  <div className="text-xs text-text-tertiary">@{project.creatorId?.username}</div>
                </div>
              </div>
              {project.creatorId?.reputationScore !== undefined && (
                <div className="flex items-center justify-between p-3 glass rounded-lg text-sm">
                  <span className="text-text-tertiary">Reputation</span>
                  <span className="font-medium text-accent-cyan">{project.creatorId.reputationScore}</span>
                </div>
              )}
            </Card>

            {/* Team */}
            {project.team?.length > 0 && (
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
                        <div className="text-xs text-text-tertiary capitalize">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Open Roles */}
            {project.openRoles?.filter((r: any) => !r.filled).length > 0 && (
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
                        <p className="text-xs text-text-secondary mt-1 mb-3">{role.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {role.skills?.map((skill: string, j: number) => (
                            <Badge key={j} variant="skill" className="text-xs px-1.5 py-0.5">{skill}</Badge>
                          ))}
                        </div>

                        {/* ✅ Hide apply button for project creator */}
                        {isCreator ? (
                          <div className="w-full text-center text-xs text-gray-500 py-2 rounded-lg border border-white/5 bg-white/3">
                            You own this project
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full text-sm"
                            onClick={() => handleApply(role.role, role.role)}
                            disabled={applying || appliedRoles.has(role.role)}
                          >
                            {applying
                              ? 'Applying...'
                              : appliedRoles.has(role.role)
                                ? '✓ Applied'
                                : `Apply for ${role.role}`}
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            )}

            {/* CTA — hidden for creator */}
            {!isCreator && (
              <Card glass className="p-6 text-center">
                <h3 className="font-medium text-sm mb-1">Ready to join?</h3>
                <p className="text-xs text-text-tertiary mb-4">Apply to become part of the team.</p>
                <Button
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => {
                    const firstOpenRole = project.openRoles?.find((r: any) => !r.filled);
                    if (firstOpenRole) handleApply(firstOpenRole.role, firstOpenRole.role);
                    else toast.error('No open roles available');
                  }}
                  disabled={applying}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </Button>
              </Card>
            )}
          </aside>
        </div>
      </div>

      // In app/projects/[id]/page.tsx
      // 
      // FIND this at the bottom of the file:
      {showChat && user && (
        <ProjectChat
          projectId={params.id as string}
          userId={user._id}
          userName={user.displayName || user.username}
          onClose={() => setShowChat(false)}
        />
      )}

      {user && isTeamMember && (
        <div style={{ display: showChat ? 'block' : 'none' }}>
          <ProjectChat
            projectId={params.id as string}
            userId={user._id}
            userName={user.displayName || user.username}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}