'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, Calendar, Trophy, ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHackathons();
  }, [filter]);

  const fetchHackathons = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`http://localhost:5000/api/hackathons${params}`);
      const data = await res.json();

      if (data.success) {
        setHackathons(data.data.hackathons);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-accent-blue/20 text-accent-blue';
      case 'active': return 'bg-accent-green/20 text-accent-green';
      case 'judging': return 'bg-accent-violet/20 text-accent-violet';
      case 'completed': return 'bg-text-tertiary/20 text-text-tertiary';
      default: return 'bg-bg-tertiary text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
             <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
              OpenGuild
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/hackathons" className="text-text-primary font-medium">
              Hackathons
            </Link>
            <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors">
              Projects
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            <span className="">Hackathons</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Compete, build, and win prizes with talented builders
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['all', 'upcoming', 'active', 'judging', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'ghost'}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl gradient-text animate-pulse">Loading hackathons...</div>
          </div>
        ) : hackathons.length === 0 ? (
          <Card glass className="p-12 text-center">
            <Trophy className="w-16 h-16 text-accent-cyan mx-auto mb-4" />
            <p className="text-xl text-text-secondary mb-4">No hackathons found</p>
            <p className="text-sm text-text-tertiary">Check back soon for upcoming events!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <Card key={hackathon._id} glass hover className="flex flex-col">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getStatusColor(hackathon.status)}>
                    {hackathon.status}
                  </Badge>
                  {hackathon.prizes && hackathon.prizes.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-accent-cyan">
                      <Trophy className="w-4 h-4" />
                      ${hackathon.prizes[0].amount}
                    </div>
                  )}
                </div>

                {/* Title */}
                <Link href={`/hackathons/${hackathon._id}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:text-accent-cyan transition-colors cursor-pointer">
                    {hackathon.name}
                  </h3>
                </Link>

                {/* Theme */}
                {hackathon.theme && (
                  <p className="text-sm text-text-secondary mb-4">{hackathon.theme}</p>
                )}

                {/* Description */}
                <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-1">
                  {hackathon.description}
                </p>

                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(hackathon.startDate).toLocaleDateString()} -{' '}
                  {new Date(hackathon.endDate).toLocaleDateString()}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Users className="w-4 h-4" />
                    {hackathon.participants?.length || 0} participants
                  </div>
                  <Link href={`/hackathons/${hackathon._id}`}>
                    <Button size="sm" variant="secondary">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
