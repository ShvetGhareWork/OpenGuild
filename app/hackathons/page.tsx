'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Users, Calendar, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchHackathons();
  }, [filter]);

  const fetchHackathons = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await fetch(`${API_URL}/hackathons${params}`);
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
      case 'upcoming': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'judging': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-500 border-white/10';
      default: return 'bg-white/5 text-gray-400';
    }
  };

  return (
    <MainLayout gridColor="#0ea5e9">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Hackathons</span>
          </h1>
          <p className="text-xl text-gray-400">
            Compete, build, and win prizes with talented builders
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mb-12 overflow-x-auto max-w-full">
          {['all', 'upcoming', 'active', 'judging', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === status 
                  ? 'bg-cyan-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="text-center py-20 bg-black/40 rounded-3xl border border-white/5">
            <div className="text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse font-bold">
              Loading hackathons...
            </div>
          </div>
        ) : hackathons.length === 0 ? (
          <Card glass className="p-20 text-center border-white/10 bg-white/5">
            <Trophy className="w-20 h-20 text-cyan-500 mx-auto mb-6 opacity-30" />
            <p className="text-xl text-white font-bold mb-2">No hackathons found</p>
            <p className="text-sm text-gray-500">Check back later for upcoming events!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon) => (
              <Card key={hackathon._id} glass className="flex flex-col border-white/10 bg-white/5 hover:border-cyan-500/30 transition-all group p-6 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Sparkles className="w-24 h-24 text-cyan-400 rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <Badge className={`${getStatusColor(hackathon.status)} border text-[10px] font-black uppercase tracking-wider px-3 py-1 ring-4 ring-black/20`}>
                      {hackathon.status}
                    </Badge>
                    {hackathon.prizes && hackathon.prizes.length > 0 && (
                      <div className="flex items-center gap-2 text-sm font-black text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        ${hackathon.prizes[0].amount}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <Link href={`/hackathons/${hackathon._id}`}>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight line-clamp-1">
                      {hackathon.name}
                    </h3>
                  </Link>

                  {/* Theme */}
                  {hackathon.theme && (
                    <p className="text-xs font-bold text-cyan-400/60 uppercase tracking-widest mb-4">{hackathon.theme}</p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-8 line-clamp-3 leading-relaxed flex-1">
                    {hackathon.description}
                  </p>

                  {/* Dates & Stats Footer */}
                  <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        {hackathon.participants?.length || 0} Builders
                      </div>
                    </div>
                    
                    <Link href={`/hackathons/${hackathon._id}`} className="block">
                      <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
