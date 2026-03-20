'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
  TrendingUp,
  Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EditProfileModal from '@/components/EditProfileModal';
import { useUser } from '@/components/providers/user-provider';
import { fetchWithAuth, API_URL, getBackendUrl } from '@/lib/api';
import CredentialsSection from '@/components/CredentialsSection';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [teamProjects, setTeamProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const projectsData = await fetchWithAuth(`${API_URL}/projects`);
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
      } catch (err) {
        console.error('Profile data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent animate-pulse font-bold">
          Loading profile...
        </div>
      </div>
    );
  }

  const displayName = user?.displayName || user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <MainLayout gridColor="#10b981">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Profile Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10">
            <div className="relative group">
              {user?.avatar ? (
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-500/10">
                  <img src={`${getBackendUrl()}${user.avatar}`} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/10">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 rounded-xl p-1.5 shadow-xl">
                 <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest">PRO</div>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-display font-bold mb-2 text-white">{displayName}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-gray-400">
                <span className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-emerald-500/50" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-emerald-500/50" />
                  Building since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowEditModal(true)} className="bg-emerald-600 hover:bg-emerald-500 border-0">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-white/5">
                <Settings className="w-5 h-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Reputation', value: user?.reputationScore ?? 0, icon: Trophy, color: 'text-emerald-400' },
            { label: 'Tokens', value: user?.tokenBalance ?? 0, icon: Sparkles, color: 'text-cyan-400' },
            { label: 'Skills', value: user?.skills?.length ?? 0, icon: Code2, color: 'text-blue-400' },
            { label: 'Level', value: user?.trustLevel ?? 'Novice', icon: Award, color: 'text-purple-400' },
          ].map((stat, i) => (
            <Card key={i} glass className="p-6 text-center border-white/10 bg-white/5 group hover:border-white/20 transition-all">
              <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
              <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px_300px] gap-8 items-start">
          
          {/* Main Area */}
          <div className="space-y-8">
            {/* About */}
            <Card glass className="p-8 border-white/10 bg-white/5">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-emerald-400" /> Professional Bio
              </h2>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                {user?.bio || "No builder bio provided. Tell the world about your journey!"}
              </p>
            </Card>

            {/* Skills */}
            <Card glass className="p-8 border-white/10 bg-white/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Verified Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((skill: any, i: number) => (
                  <Badge key={i} className={`px-4 py-1.5 rounded-xl border font-bold text-[10px] sm:text-xs tracking-wide uppercase ${
                    skill.verified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10'
                  }`}>
                    {skill.name} • {skill.level} {skill.verified && '✓'}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Combined Projects */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Owned */}
              <Card glass className="p-8 border-white/10 bg-white/5 flex flex-col h-full">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-emerald-400">
                  <Code2 className="w-5 h-5" /> Led by Me
                </h2>
                <div className="space-y-4 flex-1">
                  {myProjects.slice(0, 3).map((p) => (
                    <Link key={p._id} href={`/projects/${p._id}`} className="block p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                       <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight text-sm">{p.name}</h3>
                       <p className="text-[10px] text-gray-500 line-clamp-2">{p.description}</p>
                    </Link>
                  ))}
                  {myProjects.length === 0 && <p className="text-xs text-gray-600 italic">No projects created yet</p>}
                </div>
              </Card>
              
              {/* Team Member */}
              <Card glass className="p-8 border-white/10 bg-white/5 flex flex-col h-full">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-cyan-400">
                  <Target className="w-5 h-5" /> Team Projects
                </h2>
                <div className="space-y-4 flex-1">
                  {teamProjects.slice(0, 3).map((p) => (
                    <Link key={p._id} href={`/projects/${p._id}`} className="block p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all group">
                       <h3 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight text-sm">{p.name}</h3>
                       <p className="text-[10px] text-gray-500 line-clamp-2">{p.description}</p>
                    </Link>
                  ))}
                  {teamProjects.length === 0 && <p className="text-xs text-gray-600 italic">Work on someone's project to show it here</p>}
                </div>
              </Card>
            </div>
          </div>

          {/* Credentials Section */}
          <div className="order-last lg:order-none">
             <CredentialsSection user={user} isOwner={true} onUpdate={refreshUser} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card glass className="p-6 border-white/10 bg-white/5">
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Social Proof</h3>
              <div className="space-y-4">
                {user?.externalLinks?.github && (
                   <a href={user.externalLinks.github} target="_blank" className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300">
                      <Github className="w-5 h-5 text-emerald-400" /> GitHub
                   </a>
                )}
                {user?.externalLinks?.linkedin && (
                   <a href={user.externalLinks.linkedin} target="_blank" className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300">
                      <Linkedin className="w-5 h-5 text-cyan-400" /> LinkedIn
                   </a>
                )}
                {user?.externalLinks?.portfolio && (
                   <a href={user.externalLinks.portfolio} target="_blank" className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-sm text-gray-300">
                      <Globe className="w-5 h-5 text-purple-400" /> Portfolio
                   </a>
                )}
              </div>
            </Card>

            <Card glass className="p-6 border-white/10 bg-white/5">
               <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Recent Honors</h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">OpenGuild Early Adopter</p>
                      <p className="text-[10px] text-gray-600">Joined during alpha</p>
                    </div>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} onUpdate={refreshUser} />
      )}
    </MainLayout>
  );
}