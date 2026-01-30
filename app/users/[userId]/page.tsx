'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Badge } from '@/components/ui';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Code2,
  Github,
  Linkedin,
  Globe,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import FlickeringGrid from '@/components/ui/flickering-grid';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${params.userId}/profile`);
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
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-2xl gradient-text animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">User Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const { user, createdProjects, teamProjects } = data;
  const displayName = user.displayName || user.username || 'User';

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
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-2xl font-bold">
              OpenGuild
            </span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Profile Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt={displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-accent-cyan"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold gradient-text mb-1">
                  {displayName}
                </h1>
                <p className="text-text-secondary text-sm sm:text-base">@{user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card glass className="p-4 sm:p-6 text-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-accent-cyan mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {user.reputationScore ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Reputation</div>
          </Card>

          <Card glass className="p-4 sm:p-6 text-center">
            <Code2 className="w-8 h-8 sm:w-10 sm:h-10 text-accent-violet mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {createdProjects?.length ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Projects</div>
          </Card>

          <Card glass className="p-4 sm:p-6 text-center">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-accent-blue mx-auto mb-2 sm:mb-3" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {teamProjects?.length ?? 0}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Collaborations</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* About */}
            {user.bio && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">About</h2>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  {user.bio}
                </p>
              </Card>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">Skills</h2>
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
              </Card>
            )}

            {/* Created Projects */}
            {createdProjects && createdProjects.length > 0 && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">
                  Created Projects
                </h2>
                <div className="space-y-4">
                  {createdProjects.map((project: any) => (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-cyan/30"
                    >
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
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Team Projects */}
            {teamProjects && teamProjects.length > 0 && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">
                  Collaborations
                </h2>
                <div className="space-y-4">
                  {teamProjects.map((project: any) => (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="block p-4 glass rounded-lg hover:bg-white/10 transition-all border border-white/5 hover:border-accent-violet/30"
                    >
                      <h3 className="font-semibold text-text-primary mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <Badge variant="status" className="text-xs px-2 py-0.5">
                        {project.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            {/* External Links */}
            {user.externalLinks && Object.keys(user.externalLinks).some(key => user.externalLinks[key]) && (
              <Card glass className="p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">Links</h2>
                <div className="space-y-3">
                  {user.externalLinks.github && (
                    <a
                      href={user.externalLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors"
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
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors"
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
                      className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">Portfolio</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Member Since */}
            <Card glass className="p-5 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-4">Info</h2>
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
