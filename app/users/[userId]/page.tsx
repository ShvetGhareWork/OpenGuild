'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Trophy,
  Code2,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { API_URL, getBackendUrl } from '@/lib/api';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${params.userId}/profile`);
        const result = await res.json();

        if (result.success) {
          setData(result.data);
        } else {
          console.error('Profile not found');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.userId) {
      fetchProfile();
    }
  }, [params.userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent animate-pulse font-bold tracking-widest uppercase">
          Fetching Profile...
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card glass className="p-16 text-center border-white/10 bg-white/5">
          <User className="w-16 h-16 text-gray-800 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Builder Not Found</h1>
          <p className="text-sm text-gray-500 mb-8">This profile may have been moved or removed.</p>
          <Button onClick={() => router.back()} className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-8">Go Back</Button>
        </Card>
      </div>
    );
  }

  const { user, createdProjects, teamProjects } = data;
  const displayName = user.displayName || user.username || 'Builder';

  return (
    <MainLayout gridColor="#10b981">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Profile Header */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              {user.avatar ? (
                <img
                  src={`${getBackendUrl()}${user.avatar}`}
                  alt={displayName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-black relative z-10 shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center relative z-10 border-4 border-black shadow-2xl">
                  <User className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left pt-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                {user.verified && (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black px-2 py-1">VERIFIED BUILDER</Badge>
                )}
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">@{user.username}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center group hover:border-emerald-500/30 transition-all">
                    <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl font-black text-white">{user.reputationScore ?? 0}</div>
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">RP Score</div>
                 </div>
                 <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center group hover:border-cyan-500/30 transition-all">
                    <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl font-black text-white">{createdProjects?.length ?? 0}</div>
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Built</div>
                 </div>
                 <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-center group hover:border-violet-500/30 transition-all">
                    <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl font-black text-white">{teamProjects?.length ?? 0}</div>
                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Collabs</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column (Meta) */}
          <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            {/* External Links */}
            {(user.externalLinks?.github || user.externalLinks?.linkedin || user.externalLinks?.portfolio) && (
              <Card glass className="p-8 border-white/10 bg-white/5 rounded-3xl">
                <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 px-1">Social Chain</h2>
                <div className="space-y-4">
                  {user.externalLinks.github && (
                    <a
                      href={user.externalLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 text-gray-400 hover:text-white hover:border-emerald-500/30 transition-all group"
                    >
                      <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-tight truncate">GitHub</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {user.externalLinks.linkedin && (
                    <a
                      href={user.externalLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 text-gray-400 hover:text-white hover:border-blue-500/30 transition-all group"
                    >
                      <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-tight truncate">LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  {user.externalLinks.portfolio && (
                    <a
                      href={user.externalLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 text-gray-400 hover:text-white hover:border-cyan-500/30 transition-all group"
                    >
                      <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-tight truncate">Portfolio</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Info */}
            <Card glass className="p-8 border-white/10 bg-white/5 rounded-3xl">
              <h2 className="text-sm font-black text-white uppercase tracking-widest mb-6 px-1">Registry Info</h2>
              <div className="flex items-center gap-4 text-gray-500 px-1">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest">Member Since</p>
                   <p className="text-sm font-bold text-white uppercase tracking-tight">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (Content) */}
          <div className="lg:col-span-8 space-y-10 order-1 lg:order-2">
            {/* Bio */}
            {user.bio && (
              <div className="relative">
                 <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-transparent opacity-50 rounded-full" />
                 <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Transmission</h2>
                 <p className="text-lg text-gray-400 italic font-medium leading-relaxed bg-white/5 p-8 rounded-3xl border border-white/5 shadow-2xl">
                    "{user.bio}"
                 </p>
              </div>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Arsenal</h2>
                <div className="flex flex-wrap gap-3">
                  {user.skills.map((skill: any, i: number) => (
                    <Badge
                      key={i}
                      className={`text-xs font-black px-4 py-2 rounded-xl lowercase tracking-tight border shadow-lg ${
                        skill.verified 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ring-4 ring-emerald-500/5' 
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {skill.name} <span className="mx-2 opacity-30">/</span> {skill.level}
                      {skill.verified && <span className="ml-2 text-emerald-300">✓</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {(createdProjects?.length > 0 || teamProjects?.length > 0) && (
              <div className="space-y-10">
                {createdProjects?.length > 0 && (
                   <div className="space-y-6">
                      <h2 className="text-xl font-black text-white uppercase tracking-widest">Genesis Projects</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {createdProjects.map((project: any) => (
                          <Link key={project._id} href={`/projects/${project._id}`} className="group">
                             <Card glass className="p-6 h-full border-white/5 bg-white/5 group-hover:border-emerald-500/30 transition-all rounded-3xl flex flex-col">
                                <h3 className="text-lg font-black text-white mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{project.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">{project.description}</p>
                                <div className="flex flex-wrap gap-2 text-[10px] uppercase font-black tracking-widest">
                                   <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{project.status}</Badge>
                                   {project.techStack?.slice(0, 2).map((tech: string, i: number) => (
                                      <Badge key={i} className="bg-white/5 text-gray-600 border-white/5">{tech}</Badge>
                                   ))}
                                </div>
                             </Card>
                          </Link>
                        ))}
                      </div>
                   </div>
                )}

                {teamProjects?.length > 0 && (
                   <div className="space-y-6">
                      <h2 className="text-xl font-black text-white uppercase tracking-widest">Sector Alliances</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {teamProjects.map((project: any) => (
                          <Link key={project._id} href={`/projects/${project._id}`} className="group">
                             <Card glass className="p-6 h-full border-white/5 bg-white/5 group-hover:border-violet-500/30 transition-all rounded-3xl flex flex-col">
                                <h3 className="text-lg font-black text-white mb-2 group-hover:text-violet-400 transition-colors uppercase tracking-tight">{project.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">{project.description}</p>
                                <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] w-fit font-black uppercase tracking-widest">{project.status}</Badge>
                             </Card>
                          </Link>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
