'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Sparkles,
  Code2,
  Target,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Edit,
  Settings,
  LogOut,
  TrendingUp,
  Award,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { useUser } from '@/components/providers/user-provider';
import { fetchWithAuth, API_URL, getBackendUrl } from '@/lib/api';
import { useNotifications } from '@/hooks/useSocket';
import CredentialsSection from '@/components/CredentialsSection';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, logout, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [teamProjects, setTeamProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLiveNotification = useCallback((n: any) => {
    setNotifications(prev => [n, ...prev]);
    toast.success(n.message || 'New notification', { icon: '🔔', duration: 4000 });
  }, []);
  useNotifications(user?._id, handleLiveNotification);

  function toId(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val._id) return String(val._id);
    return String(val);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Fetch projects and notifications in parallel
        const [projectsData, notifData] = await Promise.all([
          fetchWithAuth(`${API_URL}/projects`),
          fetchWithAuth(`${API_URL}/notifications`)
        ]);

        if (projectsData.success) {
          const allProjects = projectsData.data.projects;
          setMyProjects(allProjects.filter(
            (p: any) => p.creatorId?._id === user._id || p.creatorId === user._id
          ));
          setTeamProjects(allProjects.filter((p: any) =>
            p.team?.some((member: any) =>
              (member.userId?._id === user._id || member.userId === user._id) &&
              (p.creatorId?._id !== user._id && p.creatorId !== user._id)
            )
          ));
        }

        if (notifData.success) {
          setNotifications(notifData.data.notifications);
        }
      } catch (err) {
        console.error('Profile data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading, router]);

  const handleLogout = () => {
    logout();
  };

  const handleUpdateProfile = () => {
    refreshUser();
  };

  const handleAccept = async (notif: any) => {
    const token = localStorage.getItem('auth_token');
    const projectId = toId(notif.projectId);
    const applicationId = toId(notif.applicationId);
    if (!projectId || !applicationId) { toast.error('Missing data'); return; }
    setAccepting(applicationId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${notif.applicantName || 'Applicant'} accepted! 🎉`);
        setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
      } else toast.error(data.message || 'Failed to accept');
    } catch { toast.error('Error accepting'); }
    finally { setAccepting(null); }
  };

  const handleReject = async (notif: any) => {
    const token = localStorage.getItem('auth_token');
    const projectId = toId(notif.projectId);
    const applicationId = toId(notif.applicationId);
    if (!projectId || !applicationId) { toast.error('Missing data'); return; }
    setAccepting(applicationId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Application rejected');
        setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
      } else toast.error(data.message || 'Failed to reject');
    } catch { toast.error('Error rejecting'); }
    finally { setAccepting(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-2xl gradient-text animate-pulse">Loading...</div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-black relative">
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4} gridGap={6} color="#10b981" maxOpacity={0.3} flickerChance={0.1}
      />

      {/* ── NAVBAR ── */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:hidden">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="text-gray-300 hover:text-white h-10 w-10 p-0">
              ☰
            </Button>
          </div>
          <div className="hidden lg:flex items-center justify-between py-2">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>
            <div className="flex items-center gap-6">
              {['Dashboard', 'Projects', 'Reputation', 'Tokens', 'Matching', 'Profile'].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}
                  className={`transition px-3 py-2 rounded-lg hover:bg-white/10 ${item === 'Profile' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>
                  {item}
                </Link>
              ))}
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-white/10 transition">
                <Bell className="w-5 h-5 text-gray-300" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white ml-2">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SIDEBAR ── */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 border-r border-white/10 shadow-2xl backdrop-blur-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">OpenGuild</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-2xl transition">✕</button>
            </div>
            <nav className="space-y-3 flex-1">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: <Target className="w-5 h-5" /> },
                { name: 'Projects', path: '/projects', icon: <Code2 className="w-5 h-5" /> },
                { name: 'Reputation', path: '/reputation', icon: <Trophy className="w-5 h-5" /> },
                { name: 'Tokens', path: '/tokens', icon: <Sparkles className="w-5 h-5" /> },
                { name: 'Matching', path: '/matching', icon: <TrendingUp className="w-5 h-5" /> },
                { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
              ].map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.path;
                return (
                  <button key={item.name} onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                    className={`group flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/15 text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                    <span className={`transition group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>{item.icon}</span>
                    <span className="font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </nav>
            <button onClick={() => { setShowNotifications(true); setMobileMenuOpen(false); }}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition mb-3">
              <span className="flex items-center gap-4"><Bell className="w-5 h-5" /><span className="font-medium tracking-wide">Notifications</span></span>
              {notifications.length > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
              )}
            </button>
            <div className="pt-6 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS DROPDOWN ── */}
      {showNotifications && (
        <div className="fixed top-20 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-96 max-h-[480px] flex flex-col glass border border-white/20 rounded-xl z-50 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary text-sm">Notifications</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <button onClick={() => setShowNotifications(false)} className="text-text-tertiary hover:text-text-primary transition text-lg leading-none">✕</button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="p-3 space-y-2">
                {notifications.slice(0, 5).map((notif: any, i: number) => (
                  <div key={i} className="p-3 glass rounded-lg border border-white/10 hover:border-accent-cyan/30 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-4 h-4 text-accent-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.type === 'application_received' && (
                          <>
                            <p className="text-sm text-text-primary font-medium mb-0.5 truncate">
                              <span className="text-accent-cyan">{notif.applicantName || 'Someone'}</span> applied for{' '}
                              <span className="text-white">{notif.roleName}</span>
                            </p>
                            <p className="text-xs text-text-secondary truncate mb-2">{notif.projectName}</p>
                            {notif.applicationId && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAccept(notif)} disabled={accepting === toId(notif.applicationId)} className="text-xs px-3 py-1">
                                  {accepting === toId(notif.applicationId) ? '...' : '✓ Accept'}
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleReject(notif)} disabled={accepting === toId(notif.applicationId)} className="text-xs px-3 py-1">
                                  {accepting === toId(notif.applicationId) ? '...' : '✗ Reject'}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                        {notif.type === 'application_accepted' && (
                          <><p className="text-sm text-green-400 font-medium mb-0.5">🎉 Application Accepted!</p>
                            <p className="text-xs text-text-secondary truncate">{notif.roleName} · {notif.projectName}</p></>
                        )}
                        {notif.type === 'application_rejected' && (
                          <><p className="text-sm text-text-primary font-medium mb-0.5">Application Update</p>
                            <p className="text-xs text-text-secondary truncate">{notif.roleName} · {notif.projectName}</p></>
                        )}
                        <p className="text-xs text-text-tertiary mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <p className="text-xs text-center text-gray-500 py-1">+{notifications.length - 5} more</p>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-40" />
                <p className="text-text-tertiary text-sm">No new notifications</p>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 border-t border-white/10">
            <button onClick={() => { setShowNotifications(false); router.push('/notifications'); }}
              className="w-full py-3 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> View All Notifications <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

        {/* Profile Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-accent-cyan flex-shrink-0">
                  <img src={`${getBackendUrl()}${user.avatar}`} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold flex-shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold mb-1">{displayName}</h1>
                <p className="text-text-secondary flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{user?.email}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
          <Card glass className="p-4 sm:p-6 text-center">
            <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-accent-cyan mx-auto mb-2" />
            <div className="text-xl sm:text-3xl font-bold mb-1">{user?.reputationScore ?? 0}</div>
            <div className="text-xs sm:text-sm text-text-secondary">Reputation</div>
            <Badge variant="verified" className="mt-2 text-xs px-2 py-1">{user?.trustLevel ?? 'Novice'}</Badge>
          </Card>
          <Card glass className="p-4 sm:p-6 text-center">
            <Sparkles className="w-7 h-7 sm:w-10 sm:h-10 text-accent-violet mx-auto mb-2" />
            <div className="text-xl sm:text-3xl font-bold mb-1">{user?.tokenBalance ?? 0}</div>
            <div className="text-xs sm:text-sm text-text-secondary">Tokens</div>
          </Card>
          <Card glass className="p-4 sm:p-6 text-center">
            <Code2 className="w-7 h-7 sm:w-10 sm:h-10 text-accent-blue mx-auto mb-2" />
            <div className="text-xl sm:text-3xl font-bold mb-1">{user?.skills?.length ?? 0}</div>
            <div className="text-xs sm:text-sm text-text-secondary">Skills</div>
          </Card>
          <Card glass className="p-4 sm:p-6 text-center">
            <Calendar className="w-7 h-7 sm:w-10 sm:h-10 text-accent-pink mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold mb-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Joined</div>
          </Card>
        </div>

        {/* ── 3-COLUMN GRID ─────────────────────────────────────────────────────── */}
        {/* Mobile: single column stacked
            Tablet (md): 2 columns — left content + right sidebar
            Desktop (lg): 3 columns — left content | center credentials | right sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1fr_380px_260px] gap-6 sm:gap-8 items-start">

          {/* ── LEFT COLUMN: About / Skills / Goals / Projects ── */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">

            {/* About */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-cyan" /> About
              </h2>
              {user?.bio
                ? <p className="text-text-secondary text-sm leading-relaxed">{user.bio}</p>
                : <p className="text-text-tertiary italic text-sm">No bio added yet. Click "Edit Profile" to add one.</p>
              }
            </Card>

            {/* Skills */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-cyan" /> Skills & Expertise
              </h2>
              {user?.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: any, i: number) => (
                    <Badge key={i} variant={skill.verified ? 'verified' : 'skill'} className="text-xs px-3 py-1">
                      {skill.name} • {skill.level}{skill.verified && ' ✓'}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary italic text-sm">No skills added yet.</p>
              )}
            </Card>

            {/* Goals */}
            {user?.goals && user.goals.length > 0 && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent-cyan" /> Goals
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.goals.map((goal: string, i: number) => (
                    <Badge key={i} variant="status" className="text-xs px-3 py-1">{goal}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* My Projects */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-accent-cyan" /> My Projects
              </h2>
              {myProjects.length > 0 ? (
                <div className="space-y-3">
                  {myProjects.map((project: any) => (
                    <Link key={project._id} href={`/projects/${project._id}`}
                      className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-cyan/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary mb-1 truncate">{project.name}</h3>
                          <p className="text-xs text-text-secondary line-clamp-2 mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="status" className="text-xs px-2 py-0.5">{project.status}</Badge>
                            {project.techStack?.slice(0, 2).map((tech: string, i: number) => (
                              <Badge key={i} variant="skill" className="text-xs px-2 py-0.5">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-text-tertiary">{project.team?.length || 0} members</div>
                          {project.applications?.filter((a: any) => a.status === 'pending').length > 0 && (
                            <Badge variant="status" className="text-xs px-2 py-0.5 bg-accent-pink/20 text-accent-pink mt-1">
                              {project.applications.filter((a: any) => a.status === 'pending').length} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Code2 className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-50" />
                  <p className="text-text-tertiary italic text-sm mb-4">No projects created yet.</p>
                  <Link href="/projects/create"><Button size="sm">Create Your First Project</Button></Link>
                </div>
              )}
            </Card>

            {/* Contributing To */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-violet" /> Projects I'm Working On
              </h2>
              {teamProjects.length > 0 ? (
                <div className="space-y-3">
                  {teamProjects.map((project: any) => {
                    const myRole = project.team?.find(
                      (m: any) => m.userId?._id === user._id || m.userId === user._id
                    )?.role;
                    return (
                      <Link key={project._id} href={`/projects/${project._id}`}
                        className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-violet/30">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-primary mb-1 truncate">{project.name}</h3>
                            <p className="text-xs text-text-secondary line-clamp-2 mb-2">{project.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="verified" className="text-xs px-2 py-0.5">Role: {myRole}</Badge>
                              <Badge variant="status" className="text-xs px-2 py-0.5">{project.status}</Badge>
                            </div>
                          </div>
                          <div className="text-xs text-text-tertiary flex-shrink-0">{project.team?.length || 0} members</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-text-tertiary mx-auto mb-3 opacity-50" />
                  <p className="text-text-tertiary italic text-sm">Not part of any team yet.</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── CENTER COLUMN: Credentials (full width on mobile/tablet, center on desktop) ── */}
          {/* On mobile: renders after left column naturally
              On md: spans full 2 cols below left+right, then right sidebar
              On lg: sits in the middle column */}
          <div className="md:col-span-2 lg:col-span-1 order-last md:order-none">
            <CredentialsSection
              user={user}
              isOwner={true}
              onUpdate={handleUpdateProfile}
            />
          </div>

          {/* ── RIGHT COLUMN: Profile Info / Links / Achievements ── */}
          <div className="md:col-span-1 lg:col-span-1 space-y-6 md:row-start-1 md:col-start-3 lg:row-start-auto lg:col-start-auto">

            {/* Profile Info */}
            <Card glass className="p-5">
              <h2 className="text-base sm:text-lg font-display font-bold mb-4">Profile Info</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-text-secondary mb-1">Role</div>
                  <Badge variant="status" className="text-xs px-3 py-1 capitalize">{user?.role ?? 'Builder'}</Badge>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Username</div>
                  <div className="text-sm text-text-primary">@{user?.username}</div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Member Since</div>
                  <div className="text-sm text-text-primary">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Last Active</div>
                  <div className="text-sm text-text-primary">
                    {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            {/* External Links */}
            {user?.externalLinks && Object.values(user.externalLinks).some((link: any) => link) && (
              <Card glass className="p-5">
                <h2 className="text-base sm:text-lg font-display font-bold mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent-cyan" /> Links
                </h2>
                <div className="space-y-2.5">
                  {user.externalLinks.github && (
                    <a href={user.externalLinks.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm">
                      <Github className="w-4 h-4 flex-shrink-0" /><span className="truncate">GitHub</span><ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
                    </a>
                  )}
                  {user.externalLinks.linkedin && (
                    <a href={user.externalLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm">
                      <Linkedin className="w-4 h-4 flex-shrink-0" /><span className="truncate">LinkedIn</span><ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
                    </a>
                  )}
                  {user.externalLinks.portfolio && (
                    <a href={user.externalLinks.portfolio} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm">
                      <Globe className="w-4 h-4 flex-shrink-0" /><span className="truncate">Portfolio</span><ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
                    </a>
                  )}
                  {user.externalLinks.leetcode && (
                    <a href={user.externalLinks.leetcode} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm">
                      <Code2 className="w-4 h-4 flex-shrink-0" /><span className="truncate">LeetCode</span><ExternalLink className="w-3 h-3 ml-auto flex-shrink-0" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Achievements */}
            <Card glass className="p-5">
              <h2 className="text-base sm:text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-accent-cyan" /> Achievements
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-accent-cyan" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Early Adopter</div>
                    <div className="text-xs text-text-secondary">Joined OpenGuild</div>
                  </div>
                </div>
                {user?.onboardingCompleted && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent-violet/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-accent-violet" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Profile Complete</div>
                      <div className="text-xs text-text-secondary">Completed onboarding</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </main>

      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onUpdate={handleUpdateProfile} />
      )}
      <Toaster position="top-right" />
    </div>
  );
}