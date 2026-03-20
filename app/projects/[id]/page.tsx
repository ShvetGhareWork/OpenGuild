'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowUpCircle,
  Eye,
  Users,
  Calendar,
  Target,
  MessageCircle,
  X,
  CheckCircle,
  XCircle,
  ExternalLink,
  Star,
  Zap,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/lib/dummyProjects';
import toast from 'react-hot-toast';
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-black border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Zap className="w-32 h-32 text-cyan-400 rotate-12" />
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-600 hover:text-white transition p-2 bg-white/5 rounded-xl border border-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-6">Application Request</Badge>
          <h2 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">System Access Request</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-10">
            For role <span className="text-cyan-400">{notif.roleName}</span> · <span className="text-white">{notif.projectName}</span>
          </p>

          <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl mb-8 group hover:border-cyan-500/30 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-black text-white flex-shrink-0 overflow-hidden shadow-2xl">
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
              <div className="text-2xl font-black text-white uppercase tracking-tight mb-1">{notif.applicantName}</div>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">@{notif.applicantUsername}</div>
              {notif.applicantReputation > 0 && (
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  <Star className="w-3.5 h-3.5" />
                  {notif.applicantReputation} Reputation
                </div>
              )}
            </div>

            <Link
              href={`/profile/${notif.applicantUsername || notif.applicantId}`}
              target="_blank"
              className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>

          {notif.applicantSkills && notif.applicantSkills.length > 0 && (
            <div className="mb-8">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1">Verified Skills</p>
              <div className="flex flex-wrap gap-2">
                {notif.applicantSkills.slice(0, 10).map((skill, i) => (
                  <Badge
                    key={i}
                    className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-400"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {notif.message && (
            <div className="mb-10">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1">Application Brief</p>
              <p className="text-sm text-gray-400 bg-white/5 p-5 rounded-3xl border border-white/5 italic leading-relaxed">
                "{notif.message}"
              </p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-900/20"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Onboarding
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-black text-xs uppercase tracking-widest"
            >
              <XCircle className="w-4 h-4" />
              Deny
            </button>
          </div>
        </div>
      </div>
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
  const [profileModalNotif, setProfileModalNotif] = useState<LiveNotification | null>(null);
  const socketRef = useRef<any>(null);

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

  useEffect(() => {
    if (!user?._id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    const socket = socketIO(wsUrl, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-user', { userId: user._id });
    });

    socket.on('notification', (notif: LiveNotification) => {
      if (notif.type === 'application_received' && notif.projectId === params.id) {
        // Specifically for this project, we can show a special modal if needed
        // but global notifications are handled by MainLayout
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, params.id]);

  const handleLiveUpvote = useCallback(
    (data: { projectId: string; upvotes: number }) => {
      if (data.projectId === params.id)
        setProject((p: any) => (p ? { ...p, upvotes: data.upvotes } : p));
    },
    [params.id]
  );
  useProjectUpvotes(handleLiveUpvote);

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

  const handleUpvote = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { toast.error('Please login to upvote'); return; }
    try {
      const res = await fetch(`${API_URL}/projects/${params.id}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProject({ ...project, upvotes: data.data.upvotes });
        toast.success('Project boosted!', { icon: '🚀' });
      }
    } catch (err) { console.error(err); }
  };

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
      toast.error('Error submitting application.');
    } finally {
      setApplying(false);
    }
  };

  const handleApplicationAction = async (
    notif: LiveNotification,
    action: 'accept' | 'reject'
  ) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

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
        toast.success(action === 'accept' ? 'Builder approved!' : 'Application declined');
        setProfileModalNotif(null);
        fetchProject();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('Something went wrong.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent animate-pulse font-black tracking-widest uppercase">
          Initializing project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card glass className="p-16 text-center border-white/10 bg-white/5 rounded-3xl">
          <p className="text-xl text-white font-bold mb-4">Project Unknown</p>
          <Button onClick={() => router.push('/projects')} className="bg-white/10 hover:bg-white/20 text-white rounded-xl">Back to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout gridColor="#0ea5e9">
      {profileModalNotif && isCreator && (
        <ApplicantProfileModal
          notif={profileModalNotif}
          onAccept={() => handleApplicationAction(profileModalNotif, 'accept')}
          onReject={() => handleApplicationAction(profileModalNotif, 'reject')}
          onClose={() => setProfileModalNotif(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header / Hero */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">{project.status}</Badge>
                  {isCreator && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">Project Core Lead</Badge>
                  )}
                  {isTeamMember && !isCreator && (
                    <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1">Active Team Member</Badge>
                  )}
               </div>
               <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 uppercase tracking-tight leading-tight">
                  {project.name}
               </h1>
               <p className="text-xl text-gray-400 mb-10 max-w-3xl leading-relaxed">
                  {project.description}
               </p>

               <div className="flex flex-wrap items-center gap-8">
                  <button
                    onClick={handleUpvote}
                    className="flex flex-col items-center group"
                  >
                    <ArrowUpCircle className="w-10 h-10 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all cursor-pointer mb-2" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{project.upvotes || 0} Boosts</span>
                  </button>
                  
                  <div className="h-10 w-px bg-white/10" />

                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 text-gray-600 mb-1 uppercase font-black text-[9px] tracking-widest">
                        <Eye className="w-3.5 h-3.5" /> Traction
                     </div>
                     <span className="text-sm font-black text-white">{project.views || 0} Impressions</span>
                  </div>

                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 text-gray-600 mb-1 uppercase font-black text-[9px] tracking-widest">
                        <Users className="w-3.5 h-3.5" /> Guild Members
                     </div>
                     <span className="text-sm font-black text-white">{project.team?.length || 0} Builders</span>
                  </div>

                  {isTeamMember && (
                    <Button
                      onClick={() => setShowChat(true)}
                      className="bg-violet-600 hover:bg-violet-500 rounded-2xl px-8 h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-950/20 transition-all active:scale-95 ml-auto"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Team Workspace
                    </Button>
                  )}
               </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-12">
            {project.vision && (
              <section className="relative">
                 <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-transparent opacity-50 rounded-full" />
                 <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Mission & Vision</h2>
                 <p className="text-lg text-gray-400 font-medium leading-relaxed bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    "{project.vision}"
                 </p>
              </section>
            )}

            <section>
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 px-1">Infrastructure</h2>
              <div className="flex flex-wrap gap-3">
                {project.techStack?.map((tech: string, i: number) => (
                  <Badge key={i} className="bg-white/5 text-gray-400 border-white/10 text-xs font-black px-4 py-2 rounded-xl lowercase tracking-tight hover:bg-white/10 hover:text-white transition-all cursor-default shadow-lg">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>

            {project.milestones?.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 px-1">Project Roadmap</h2>
                <div className="space-y-6">
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
                        className={`p-8 rounded-[2rem] border transition-all relative group overflow-hidden ${
                          milestone.completed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-950/10' 
                            : 'bg-white/3 border-white/10 hover:border-cyan-500/20 shadow-2xl'
                        }`}
                      >
                         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            {milestone.completed ? <CheckCircle className="w-24 h-24 text-emerald-400" /> : <Target className="w-24 h-24 text-cyan-400" />}
                         </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                          <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{milestone.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-xl">{milestone.description}</p>
                            {milestone.deadline && (
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-700">
                                <Calendar className="w-3.5 h-3.5" />
                                Deadline: {new Date(milestone.deadline).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {isTeamMember ? (
                              <button
                                onClick={toggleMilestone}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                  milestone.completed
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                                }`}
                              >
                                {milestone.completed ? 'COMPLETED' : 'MARK COMPLETE'}
                              </button>
                            ) : (
                              milestone.completed ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-4 py-2">DEPLOYED</Badge>
                              ) : (
                                <Badge className="bg-white/5 text-gray-700 border-white/5 text-[10px] font-black uppercase tracking-widest px-4 py-2">UPCOMING</Badge>
                              )
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            {/* Project Lead */}
            <Card glass className="p-8 border-white/10 bg-white/5 rounded-3xl">
              <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-8">System Architect</h2>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-2xl">
                  {project.creatorId?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                   <h3 className="font-black text-white text-lg uppercase tracking-tight">{project.creatorId?.displayName}</h3>
                   <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">@{project.creatorId?.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-center group hover:border-emerald-500/30 transition-all">
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">Reputation</p>
                    <p className="text-xl font-black text-emerald-400">{project.creatorId?.reputationScore ?? 0}</p>
                 </div>
                 <Link href={`/profile/${project.creatorId?.username || project.creatorId?._id}`} className="block">
                    <Button variant="ghost" className="w-full h-full bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-cyan-500/30">
                       <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">View</p>
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Profile</p>
                    </Button>
                 </Link>
              </div>
            </Card>

            {/* Team Members */}
            {project.team?.length > 0 && (
              <Card glass className="p-8 border-white/10 bg-white/5 rounded-3xl">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-8">The Guild ({project.team.length})</h2>
                <div className="space-y-4">
                  {project.team.map((member: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black text-gray-600 border border-white/5 group-hover:bg-violet-500/10 group-hover:text-violet-400 group-hover:border-violet-500/20 transition-all">
                        {member.userId?.displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white uppercase tracking-tight truncate">{member.userId?.displayName}</div>
                        <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest truncate">{member.role}</div>
                      </div>
                      <Link href={`/profile/${member.userId?.username || member.userId?._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink className="w-3.5 h-3.5 text-gray-600 hover:text-white" />
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Open Roles */}
            {project.openRoles?.filter((r: any) => !r.filled).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">Sector Access Available</h2>
                {project.openRoles
                  .filter((role: any) => !role.filled)
                  .map((role: any, i: number) => (
                    <Card key={i} glass className="p-8 border-white/10 bg-white/5 rounded-3xl hover:border-cyan-500/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="font-black text-lg text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{role.role}</h4>
                         <Sparkles className="w-5 h-5 text-cyan-500/30 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">{role.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                        {role.skills?.map((skill: string, j: number) => (
                          <Badge key={j} className="bg-black/40 text-[9px] font-black uppercase tracking-widest text-gray-600 border-white/5 px-2 py-1">{skill}</Badge>
                        ))}
                      </div>

                      {isCreator ? (
                        <div className="w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-700 py-3 rounded-2xl bg-black/40 border border-white/5">
                          OWNER ACCESS
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest"
                          onClick={() => handleApply(role.role, role.role)}
                          disabled={applying || appliedRoles.has(role.role)}
                        >
                          {applying
                            ? 'REQUESTING...'
                            : appliedRoles.has(role.role)
                              ? 'REQUEST SENT'
                              : `JOIN AS ${role.role}`}
                        </Button>
                      )}
                    </Card>
                  ))}
              </div>
            )}
          </aside>
        </div>
      </div>

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
    </MainLayout>
  );
}