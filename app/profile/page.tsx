'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
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
import { API_URL, getBackendUrl } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [teamProjects, setTeamProjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!data.success) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          router.push('/login');
          return;
        }

        setUser(data.data);
        
        // Fetch user's projects and team projects
        try {
          const projectsRes = await fetch(`${API_URL}/projects`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const projectsData = await projectsRes.json();
          if (projectsData.success) {
            const allProjects = projectsData.data.projects;
            
            // Filter projects created by this user
            const userProjects = allProjects.filter(
              (p: any) => p.creatorId?._id === data.data._id || p.creatorId === data.data._id
            );
            setMyProjects(userProjects);
            
            // Filter projects where user is a team member
            const userTeamProjects = allProjects.filter((p: any) =>
              p.team?.some((member: any) => 
                (member.userId?._id === data.data._id || member.userId === data.data._id) &&
                (p.creatorId?._id !== data.data._id && p.creatorId !== data.data._id)
              )
            );
            setTeamProjects(userTeamProjects);
          }
        } catch (err) {
          console.error('Projects fetch error:', err);
        }
        
        // Fetch notifications from database
        try {
          const notifRes = await fetch(`${API_URL}/notifications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const notifData = await notifRes.json();
          if (notifData.success) {
            setNotifications(notifData.data.notifications);
          }
        } catch (err) {
          console.error('Notifications fetch error:', err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    router.push('/');
  };

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleAccept = async (projectId: string, applicationId: string) => {
    const token = localStorage.getItem('auth_token');
    setAccepting(applicationId);

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'accept' }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success('Application accepted! User added to team.');
        // Refresh notifications
        const notifRes = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotifications(notifData.data.notifications);
        }
      } else {
        toast.error(data.message || 'Failed to accept application');
      }
    } catch (err) {
      toast.error('Error accepting application');
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (projectId: string, applicationId: string) => {
    const token = localStorage.getItem('auth_token');
    setAccepting(applicationId);

    try {
      const res = await fetch(
        `${API_URL}/projects/${projectId}/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'reject' }),
        }
      );

      const data = await res.json();
      if (data.success) {
        toast.success('Application rejected');
        // Refresh notifications
        const notifRes = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const notifData = await notifRes.json();
        if (notifData.success) {
          setNotifications(notifData.data.notifications);
        }
      } else {
        toast.error(data.message || 'Failed to reject application');
      }
    } catch (err) {
      toast.error('Error rejecting application');
    } finally {
      setAccepting(null);
    }
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
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#10b981"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
           <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-2xl font-regular font-bold">
               OpenGuild
              </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors text-sm sm:text-base">
              Dashboard
            </Link>
            <Link href="/profile" className="text-text-primary font-medium text-sm sm:text-base">
              Profile
            </Link>
            
            {/* Notifications Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-pink rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed top-20 right-4 sm:right-8 w-80 sm:w-96 max-h-96 overflow-y-auto glass border border-white/20 rounded-xl p-4 z-50 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-text-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif: any, i: number) => (
                <div
                  key={i}
                  className="p-3 glass rounded-lg border border-white/10 hover:border-accent-cyan/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <div className="flex-1">
                      {notif.type === 'application_received' && (
                        <>
                          <p className="text-sm text-text-primary font-medium mb-1">
                            New application for <span className="text-accent-cyan">{notif.roleName}</span>
                          </p>
                          <p className="text-xs text-text-secondary mb-2">
                            Project: {notif.projectName}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-text-tertiary italic mb-2">
                              "{notif.message}"
                            </p>
                          )}
                          {notif.applicationId ? (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(notif.projectId, notif.applicationId)}
                                disabled={accepting === notif.applicationId}
                                className="text-xs px-3 py-1"
                              >
                                {accepting === notif.applicationId ? '...' : '✓ Accept'}
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleReject(notif.projectId, notif.applicationId)}
                                disabled={accepting === notif.applicationId}
                                className="text-xs px-3 py-1"
                              >
                                {accepting === notif.applicationId ? '...' : '✗ Reject'}
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-text-tertiary mt-2 italic">
                              Old notification - please check project page to manage applications
                            </p>
                          )}
                        </>
                      )}
                      {notif.type === 'application_accepted' && (
                        <>
                          <p className="text-sm text-text-primary font-medium mb-1">
                            🎉 Application Accepted!
                          </p>
                          <p className="text-xs text-text-secondary mb-2">
                            You've been accepted for <span className="text-accent-cyan">{notif.roleName}</span> at {notif.projectName}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-text-tertiary italic">
                              "{notif.message}"
                            </p>
                          )}
                        </>
                      )}
                      {notif.type === 'application_rejected' && (
                        <>
                          <p className="text-sm text-text-primary font-medium mb-1">
                            Application Update
                          </p>
                          <p className="text-xs text-text-secondary mb-2">
                            Your application for <span className="text-accent-cyan">{notif.roleName}</span> at {notif.projectName}
                          </p>
                          {notif.message && (
                            <p className="text-xs text-text-tertiary italic">
                              "{notif.message}"
                            </p>
                          )}
                        </>
                      )}
                      <p className="text-xs text-text-tertiary mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/projects/${notif.projectId}`}
                    className="block mt-2 text-xs text-accent-cyan hover:underline"
                  >
                    View Project →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
              <p className="text-text-tertiary text-sm">No new notifications</p>
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Profile Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-accent-cyan">
                  <img
                    src={`${getBackendUrl()}${user.avatar}`}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-primary flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold mb-1">
                  {displayName}
                </h1>
                <p className="text-text-secondary flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card glass className="p-4 sm:p-6 text-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-accent-cyan mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {user?.reputationScore ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Reputation</div>
            <Badge variant="verified" className="mt-2 text-xs px-2 py-1">
              {user?.trustLevel ?? 'Novice'}
            </Badge>
          </Card>

          <Card glass className="p-4 sm:p-6 text-center">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-accent-violet mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {user?.tokenBalance ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Tokens</div>
          </Card>

          <Card glass className="p-4 sm:p-6 text-center">
            <Code2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {user?.skills?.length ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Skills</div>
          </Card>

          <Card glass className="p-4 sm:p-6 text-center">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-accent-pink mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Joined</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About Section */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                About
              </h2>
              {user?.bio ? (
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-text-tertiary italic text-sm sm:text-base">
                  No bio added yet. Click "Edit Profile" to add one.
                </p>
              )}
            </Card>

            {/* Skills Section */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                Skills & Expertise
              </h2>
              {user?.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {user.skills.map((skill: any, i: number) => (
                    <Badge
                      key={i}
                      variant={skill.verified ? 'verified' : 'skill'}
                      className="text-xs sm:text-sm px-3 py-1"
                    >
                      {skill.name} • {skill.level}
                      {skill.verified && ' ✓'}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-text-tertiary italic text-sm sm:text-base">
                  No skills added yet.
                </p>
              )}
            </Card>

            {/* Goals Section */}
            {user?.goals && user.goals.length > 0 && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                  Goals
                </h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {user.goals.map((goal: string, i: number) => (
                    <Badge key={i} variant="status" className="text-xs sm:text-sm px-3 py-1">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
            
            {/* My Projects Section */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                My Projects
              </h2>
              {myProjects.length > 0 ? (
                <div className="space-y-4">
                  {myProjects.map((project: any) => (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-cyan/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary mb-1">
                            {project.name}
                          </h3>
                          <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="status" className="text-xs px-2 py-0.5">
                              {project.status}
                            </Badge>
                            {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                              <Badge key={i} variant="skill" className="text-xs px-2 py-0.5">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-text-tertiary mb-1">
                            {project.team?.length || 0} members
                          </div>
                          {project.applications?.filter((a: any) => a.status === 'pending').length > 0 && (
                            <Badge variant="status" className="text-xs px-2 py-0.5 bg-accent-pink/20 text-accent-pink">
                              {project.applications.filter((a: any) => a.status === 'pending').length} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code2 className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
                  <p className="text-text-tertiary italic text-sm sm:text-base mb-4">
                    No projects created yet.
                  </p>
                  <Link href="/projects/create">
                    <Button size="sm">
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
            
            {/* Projects I'm Working On */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent-violet" />
                Projects I'm Working On
              </h2>
              {teamProjects.length > 0 ? (
                <div className="space-y-4">
                  {teamProjects.map((project: any) => {
                    const myRole = project.team?.find(
                      (m: any) => (m.userId?._id === user._id || m.userId === user._id)
                    )?.role;
                    
                    return (
                      <Link
                        key={project._id}
                        href={`/projects/${project._id}`}
                        className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-violet/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">
                              {project.name}
                            </h3>
                            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="verified" className="text-xs px-2 py-0.5">
                                Your Role: {myRole}
                              </Badge>
                              <Badge variant="status" className="text-xs px-2 py-0.5">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-text-tertiary mb-1">
                              {project.team?.length || 0} members
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
                  <p className="text-text-tertiary italic text-sm sm:text-base">
                    Not part of any team yet.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            {/* Role & Info */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4">
                Profile Info
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs sm:text-sm text-text-secondary mb-1">Role</div>
                  <Badge variant="status" className="text-xs sm:text-sm px-3 py-1 capitalize">
                    {user?.role ?? 'Builder'}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-text-secondary mb-1">Username</div>
                  <div className="text-sm sm:text-base text-text-primary">@{user?.username}</div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-text-secondary mb-1">Member Since</div>
                  <div className="text-sm sm:text-base text-text-primary">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-text-secondary mb-1">Last Active</div>
                  <div className="text-sm sm:text-base text-text-primary">
                    {user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            {/* External Links */}
            {user?.externalLinks && Object.values(user.externalLinks).some((link: any) => link) && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-accent-cyan" />
                  Links
                </h2>
                <div className="space-y-3">
                  {user.externalLinks.github && (
                    <a
                      href={user.externalLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm sm:text-base"
                    >
                      <Github className="w-4 h-4" />
                      <span className="truncate">GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {user.externalLinks.linkedin && (
                    <a
                      href={user.externalLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm sm:text-base"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="truncate">LinkedIn</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {user.externalLinks.portfolio && (
                    <a
                      href={user.externalLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm sm:text-base"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">Portfolio</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  {user.externalLinks.leetcode && (
                    <a
                      href={user.externalLinks.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors text-sm sm:text-base"
                    >
                      <Code2 className="w-4 h-4" />
                      <span className="truncate">LeetCode</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Achievements */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent-cyan" />
                Achievements
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Early Adopter</div>
                    <div className="text-xs text-text-secondary">Joined OpenGuild</div>
                  </div>
                </div>
                {user?.onboardingCompleted && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-violet/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent-violet" />
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
      
      <Toaster position="top-right" />
    </div>
  );
}
