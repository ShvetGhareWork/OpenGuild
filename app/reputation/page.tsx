'use client';

import MainLayout from '@/components/MainLayout';
import { Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Target, Calendar, CheckCircle, Trophy } from 'lucide-react';
import Link from 'next/link';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedButton } from '@/components/ui/animated-button';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ReputationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchReputationData();
  }, []);

  const fetchReputationData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const [breakdownRes, contributionsRes] = await Promise.all([
        fetch(`${API_URL}/reputation/breakdown`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reputation/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const breakdown = await breakdownRes.json();
      const contributions = await contributionsRes.json();

      if (breakdown.success && contributions.success) {
        setData({
          ...breakdown.data,
          contributions: contributions.data.contributions,
          skillGraph: contributions.data.skillGraph,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent animate-pulse font-bold">
          Loading reputation...
        </div>
      </div>
    );
  }

  return (
    <MainLayout gridColor="#a855f7">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Your <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Reputation</span>
          </h1>
          <p className="text-xl text-gray-400">
            Track your contributions and skill growth
          </p>
        </div>

        {/* Stats Overview - Bento Grid */}
        <BentoGrid className="lg:grid-rows-3 mb-12">
          {/* Reputation Score - Large Card */}
          <BentoCard
            name="Reputation Score"
            description={`${data?.reputationScore || 0} points • ${data?.trustLevel || 'novice'} level`}
            Icon={Award}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
            }
            cta="View Breakdown"
            onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2 border-white/10 bg-white/5"
          />

          {/* Total Contributions - Medium Card */}
          <BentoCard
            name="Total Contributions"
            description={`${data?.totalContributions || 0} contributions across all projects`}
            Icon={CheckCircle}
            background={
              <div className="absolute inset-0 bg-emerald-500/5" />
            }
            cta="See All"
            onClick={() => document.getElementById('contributions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-3 border-white/10 bg-white/5"
          />

          {/* Contribution Types - Small Card */}
          <BentoCard
            name="Contribution Types"
            description={`${Object.keys(data?.breakdown || {}).length} different types`}
            Icon={TrendingUp}
            background={
              <div className="absolute inset-0 bg-purple-500/5" />
            }
            cta="View Types"
            onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4 border-white/10 bg-white/5"
          />

          {/* Verified Skills - Small Card */}
          <BentoCard
            name="Verified Skills"
            description={`${Object.keys(data?.skillGraph || {}).length} skills verified`}
            Icon={Target}
            background={
              <div className="absolute inset-0 bg-cyan-500/10" />
            }
            cta="Manage Skills"
            onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2 border-white/10 bg-white/5"
          />

          {/* Recent Achievement - Medium Card */}
          <BentoCard
            name="Recent Achievement"
            description={data?.contributions?.[0]
              ? `${data.contributions[0].type.replace(/_/g, ' ')} • +${data.contributions[0].reputationEarned} rep`
              : "Start contributing to earn achievements"
            }
            Icon={Sparkles}
            background={
              <div className="absolute inset-0 bg-purple-500/10" />
            }
            cta="View All"
            onClick={() => document.getElementById('contributions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4 border-white/10 bg-white/5"
          />
        </BentoGrid>

        {/* Contribution Breakdown */}
        <Card glass className="p-8 mb-12 border-white/10 bg-white/5" id="breakdown">
          <h2 className="text-2xl font-display font-bold mb-6 text-white text-center sm:text-left">Contribution Breakdown</h2>

          {data?.breakdown && Object.keys(data.breakdown).length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(data.breakdown).map(([type, stats]: [string, any]) => (
                <div key={type} className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/30 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-200 capitalize group-hover:text-purple-400 transition-colors">
                      {type.replace(/_/g, ' ')}
                    </h3>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">{stats.count} items</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Reputation</span>
                      <span className="text-emerald-400 font-bold">+{stats.totalReputation}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Avg Impact</span>
                      <span className="text-purple-400 font-bold">{stats.avgImpact}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 italic">
              No contributions yet. Start building to earn reputation!
            </div>
          )}
        </Card>

        {/* Skill Graph */}
        <Card glass className="p-8 mb-12 border-white/10 bg-white/5" id="skills">
          <h2 className="text-2xl font-display font-bold mb-6 text-white text-center sm:text-left">Skill Trust Graph</h2>

          {data?.skillGraph && Object.keys(data.skillGraph).length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(data.skillGraph).map(([skill, info]: [string, any]) => (
                <div key={skill} className="p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm">{skill}</h3>
                    {info.verified && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px]">VERIFIED</Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-gray-500">Level</span>
                      <span className="text-cyan-400">{info.level}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${info.score}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold">
                      TRUST SCORE: {info.score}/100
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 italic">
              No skills verified yet. Complete onboarding to add skills!
            </div>
          )}
        </Card>

        {/* Recent Contributions */}
        <Card glass className="p-8 border-white/10 bg-white/5" id="contributions">
          <h2 className="text-2xl font-display font-bold mb-6 text-white text-center sm:text-left">Recent Contributions</h2>

          {data?.contributions && data.contributions.length > 0 ? (
            <div className="space-y-4">
              {data.contributions.slice(0, 10).map((contribution: any) => (
                <div key={contribution._id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-start gap-4 hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white capitalize truncate text-sm sm:text-base">
                          {contribution.type.replace(/_/g, ' ')}
                        </h3>
                        {contribution.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{contribution.description}</p>
                        )}
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">+{contribution.reputationEarned} REP</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] sm:text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        Impact: {contribution.impactScore}/100
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </div>
                      {contribution.projectId && (
                        <Link
                          href={`/projects/${contribution.projectId._id}`}
                          className="text-purple-400 hover:text-purple-300 font-bold"
                        >
                          {contribution.projectId.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 mb-6 font-medium">You haven't made any contributions yet</p>
              <AnimatedButton href="/projects" variant="primary">
                Start Contributing
              </AnimatedButton>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
