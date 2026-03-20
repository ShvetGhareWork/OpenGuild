'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState } from 'react';
import {
    User,
    Trophy,
    Sparkles,
    Code2,
    Target,
    ExternalLink,
    Github,
    Linkedin,
    Globe,
    ArrowLeft,
    Award,
    TrendingUp,
    Calendar,
    Star,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { API_URL, getBackendUrl } from '@/lib/api';
import CredentialsSection from '@/components/CredentialsSection';

export default function PublicProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [profileUser, setProfileUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [teamProjects, setTeamProjects] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Try fetching by ID first
            const res = await fetch(`${API_URL}/users/${id}`);
            const data = await res.json();

            if (!data.success || !data.data) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            const user = data.data;
            setProfileUser(user);

            // Fetch their projects
            try {
                const token = localStorage.getItem('auth_token');
                const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
                const projectsRes = await fetch(`${API_URL}/projects`, { headers });
                const projectsData = await projectsRes.json();

                if (projectsData.success) {
                    const all = projectsData.data.projects;

                    setMyProjects(
                        all.filter(
                            (p: any) => p.creatorId?._id === user._id || p.creatorId === user._id
                        )
                    );

                    setTeamProjects(
                        all.filter((p: any) =>
                            p.team?.some(
                                (m: any) =>
                                    (m.userId?._id === user._id || m.userId === user._id) &&
                                    p.creatorId?._id !== user._id &&
                                    p.creatorId !== user._id
                            )
                        )
                    );
                }
            } catch (err) {
                console.error('Projects fetch error:', err);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="text-2xl gradient-text animate-pulse">Loading profile...</div>
            </div>
        );
    }

    // ── Not found ──────────────────────────────────────────────────────────────
    if (notFound || !profileUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <Card glass className="p-10 text-center max-w-md mx-4">
                    <User className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-40" />
                    <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
                    <p className="text-text-secondary mb-6 text-sm">
                        This user doesn't exist or their profile is private.
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </Card>
            </div>
        );
    }

    const displayName =
        profileUser.displayName || profileUser.username || profileUser.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen bg-black relative">
            <FlickeringGrid
                className="z-0 absolute inset-0 w-full h-full"
                squareSize={4}
                gridGap={6}
                color="#8b5cf6"
                maxOpacity={0.2}
                flickerChance={0.08}
            />

            {/* Navbar */}
            <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent"
                    >
                        OpenGuild
                    </Link>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <Link
                            href="/projects"
                            className="text-sm text-gray-400 hover:text-white transition hidden sm:block"
                        >
                            Projects
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">

                {/* ── Profile Header ── */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Avatar */}
                        {profileUser.avatar ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-violet-500 flex-shrink-0">
                                <img
                                    src={`${getBackendUrl()}${profileUser.avatar}`}
                                    alt={displayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold flex-shrink-0">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-3xl sm:text-4xl font-bold">{displayName}</h1>
                                {profileUser.trustLevel && (
                                    <Badge variant="verified" className="text-xs px-2 py-1 capitalize">
                                        {profileUser.trustLevel}
                                    </Badge>
                                )}
                            </div>
                            {profileUser.username && (
                                <p className="text-gray-400 text-sm mb-2">@{profileUser.username}</p>
                            )}
                            {profileUser.bio && (
                                <p className="text-gray-300 text-sm max-w-xl leading-relaxed">{profileUser.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    <Card glass className="p-4 sm:p-5 text-center">
                        <Trophy className="w-7 h-7 text-cyan-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-0.5">{profileUser.reputationScore ?? 0}</div>
                        <div className="text-xs text-gray-400">Reputation</div>
                    </Card>
                    <Card glass className="p-4 sm:p-5 text-center">
                        <Code2 className="w-7 h-7 text-violet-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-0.5">{profileUser.skills?.length ?? 0}</div>
                        <div className="text-xs text-gray-400">Skills</div>
                    </Card>
                    <Card glass className="p-4 sm:p-5 text-center">
                        <Target className="w-7 h-7 text-pink-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-0.5">{myProjects.length}</div>
                        <div className="text-xs text-gray-400">Projects</div>
                    </Card>
                    <Card glass className="p-4 sm:p-5 text-center">
                        <Star className="w-7 h-7 text-yellow-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold mb-0.5">{teamProjects.length}</div>
                        <div className="text-xs text-gray-400">Teams</div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* ── Left / Main ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Skills */}
                        {profileUser.skills?.length > 0 && (
                            <Card glass className="p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                    Skills &amp; Expertise
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileUser.skills.map((skill: any, i: number) => (
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
                            </Card>
                        )}

                        {/* Goals */}
                        {profileUser.goals?.length > 0 && (
                            <Card glass className="p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-cyan-400" />
                                    Goals
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profileUser.goals.map((goal: string, i: number) => (
                                        <Badge key={i} variant="status" className="text-xs sm:text-sm px-3 py-1">
                                            {goal}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Their Projects */}
                        {myProjects.length > 0 && (
                            <Card glass className="p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <Code2 className="w-5 h-5 text-cyan-400" />
                                    Projects by {displayName}
                                </h2>
                                <div className="space-y-3">
                                    {myProjects.map((project: any) => (
                                        <Link
                                            key={project._id}
                                            href={`/projects/${project._id}`}
                                            className="block p-4 glass rounded-lg hover:bg-white/10 transition border border-white/5 hover:border-cyan-500/30"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                                        {project.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
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
                                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                                    {project.team?.length || 0} members
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Team Projects */}
                        {teamProjects.length > 0 && (
                            <Card glass className="p-5 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-violet-400" />
                                    Contributing To
                                </h2>
                                <div className="space-y-3">
                                    {teamProjects.map((project: any) => {
                                        const theirRole = project.team?.find(
                                            (m: any) =>
                                                m.userId?._id === profileUser._id || m.userId === profileUser._id
                                        )?.role;

                                        return (
                                            <Link
                                                key={project._id}
                                                href={`/projects/${project._id}`}
                                                className="block p-4 glass rounded-lg hover:bg-white/10 transition border border-white/5 hover:border-violet-500/30"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                                                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                                            {project.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {theirRole && (
                                                                <Badge variant="verified" className="text-xs px-2 py-0.5 capitalize">
                                                                    {theirRole}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="status" className="text-xs px-2 py-0.5">
                                                                {project.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>

                    <CredentialsSection
                        user={profileUser}
                        isOwner={false}
                    />

                    {/* ── Right Sidebar ── */}
                    <div className="space-y-6">
                        {/* Profile Info */}
                        <Card glass className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold mb-4">Profile Info</h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">Role</div>
                                    <Badge variant="status" className="text-xs px-3 py-1 capitalize">
                                        {profileUser.role ?? 'Builder'}
                                    </Badge>
                                </div>
                                {profileUser.username && (
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Username</div>
                                        <div className="text-gray-200">@{profileUser.username}</div>
                                    </div>
                                )}
                                {profileUser.createdAt && (
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Member Since</div>
                                        <div className="text-gray-200 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(profileUser.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* External Links */}
                        {profileUser.externalLinks &&
                            Object.values(profileUser.externalLinks).some((v: any) => v) && (
                                <Card glass className="p-5 sm:p-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-cyan-400" />
                                        Links
                                    </h2>
                                    <div className="space-y-3">
                                        {profileUser.externalLinks.github && (
                                            <a
                                                href={profileUser.externalLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm"
                                            >
                                                <Github className="w-4 h-4" />
                                                GitHub
                                                <ExternalLink className="w-3 h-3 ml-auto" />
                                            </a>
                                        )}
                                        {profileUser.externalLinks.linkedin && (
                                            <a
                                                href={profileUser.externalLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                                LinkedIn
                                                <ExternalLink className="w-3 h-3 ml-auto" />
                                            </a>
                                        )}
                                        {profileUser.externalLinks.portfolio && (
                                            <a
                                                href={profileUser.externalLinks.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm"
                                            >
                                                <Globe className="w-4 h-4" />
                                                Portfolio
                                                <ExternalLink className="w-3 h-3 ml-auto" />
                                            </a>
                                        )}
                                        {profileUser.externalLinks.leetcode && (
                                            <a
                                                href={profileUser.externalLinks.leetcode}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm"
                                            >
                                                <Code2 className="w-4 h-4" />
                                                LeetCode
                                                <ExternalLink className="w-3 h-3 ml-auto" />
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            )}

                        {/* Achievements */}
                        <Card glass className="p-5 sm:p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4 text-cyan-400" />
                                Achievements
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <Trophy className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">Early Adopter</div>
                                        <div className="text-xs text-gray-400">Joined OpenGuild</div>
                                    </div>
                                </div>
                                {profileUser.onboardingCompleted && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-violet-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Profile Complete</div>
                                            <div className="text-xs text-gray-400">Completed onboarding</div>
                                        </div>
                                    </div>
                                )}
                                {myProjects.length >= 1 && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-pink-500/20 flex items-center justify-center">
                                            <Code2 className="w-4 h-4 text-pink-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Project Creator</div>
                                            <div className="text-xs text-gray-400">
                                                Built {myProjects.length} project{myProjects.length > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}