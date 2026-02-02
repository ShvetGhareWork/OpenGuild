'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Target, Calendar, CheckCircle, LogOut, Code2, Trophy, Zap, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedButton } from '@/components/ui/animated-button';
import { API_URL } from '@/lib/api';

export default function ReputationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl gradient-text animate-pulse">Loading reputation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#a855f7"
        maxOpacity={0.3}
        flickerChance={0.1}
      />
      {/* ================= NAVBAR ================= */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent"
          >
            OpenGuild
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-300 text-2xl"
          >
            ☰
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-white">
              Dashboard
            </Link>
            <Link href="/projects" className="text-text-secondary hover:text-white">
              Projects
            </Link>
            <Link href="/reputation" className="text-white font-semibold">
              Reputation
            </Link>
            <Link href="/tokens" className="text-text-secondary hover:text-white">
              Tokens
            </Link>
            <Link href="/matching" className="text-text-secondary hover:text-white">
              Matching
            </Link>
            <Link href="/profile" className="text-text-secondary hover:text-white">
              Profile
            </Link>
            <AnimatedButton href="/projects/create" variant="primary">
              Create Project
            </AnimatedButton>
          </div>
        </div>
      </nav>


      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70" />

        <div
          className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900 via-black to-gray-900
          border-r border-white/10 backdrop-blur-xl shadow-2xl transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">OpenGuild</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 text-xl">
                ✕
              </button>
            </div>

            {[
              { name: 'Dashboard', path: '/dashboard', icon: <Target className="w-5 h-5" /> },
              { name: 'Projects', path: '/projects', icon: <Code2 className="w-5 h-5" /> },
              { name: 'Reputation', path: '/reputation', icon: <Trophy className="w-5 h-5" /> },
              { name: 'Tokens', path: '/tokens', icon: <Zap className="w-5 h-5" /> },
              { name: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10"
              >
                {item.icon}
                {item.name}
              </button>
            ))}

            <button
              onClick={() => router.push('/')}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            Your <span className="">Reputation</span>
          </h1>
          <p className="text-xl text-text-secondary">
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
              <FlickeringGrid
                className="absolute inset-0 w-full h-full"
                squareSize={4}
                gridGap={6}
                color="#00d4ff"
                maxOpacity={0.2}
                flickerChance={0.1}
              />
            }
            cta="View Breakdown"
            onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2"
          />

          {/* Total Contributions - Medium Card */}
          <BentoCard
            name="Total Contributions"
            description={`${data?.totalContributions || 0} contributions across all projects`}
            Icon={CheckCircle}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-cyan/10" />
            }
            cta="See All"
            onClick={() => document.getElementById('contributions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-3"
          />

          {/* Contribution Types - Small Card */}
          <BentoCard
            name="Contribution Types"
            description={`${Object.keys(data?.breakdown || {}).length} different types`}
            Icon={TrendingUp}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent-pink/10" />
            }
            cta="View Types"
            onClick={() => document.getElementById('breakdown')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4"
          />

          {/* Verified Skills - Small Card */}
          <BentoCard
            name="Verified Skills"
            description={`${Object.keys(data?.skillGraph || {}).length} skills verified`}
            Icon={Target}
            background={
              <FlickeringGrid
                className="absolute inset-0 w-full h-full"
                squareSize={4}
                gridGap={6}
                color="#a855f7"
                maxOpacity={0.2}
                flickerChance={0.1}
              />
            }
            cta="Manage Skills"
            onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
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
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/10 via-accent-violet/5 to-accent-cyan/10" />
                <div className="absolute top-4 right-4 w-32 h-32 bg-accent-yellow/20 rounded-full blur-3xl" />
              </div>
            }
            cta="View All"
            onClick={() => document.getElementById('contributions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4"
          />
        </BentoGrid>

        {/* Contribution Breakdown */}
        <Card glass className="p-8 mb-12" id="breakdown">
          <h2 className="text-2xl font-display font-bold mb-6">Contribution Breakdown</h2>

          {data?.breakdown && Object.keys(data.breakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.breakdown).map(([type, stats]: [string, any]) => (
                <div key={type} className="p-4 glass rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">
                      {type.replace(/_/g, ' ')}
                    </h3>
                    <Badge variant="status">{stats.count} contributions</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Total Reputation:</span>
                      <span className="ml-2 font-semibold text-accent-cyan">
                        +{stats.totalReputation}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Avg Impact:</span>
                      <span className="ml-2 font-semibold text-accent-violet">
                        {stats.avgImpact}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">
              No contributions yet. Start building to earn reputation!
            </p>
          )}
        </Card>

        {/* Skill Graph */}
        <Card glass className="p-8 mb-12" id="skills">
          <h2 className="text-2xl font-display font-bold mb-6">Skill Trust Graph</h2>

          {data?.skillGraph && Object.keys(data.skillGraph).length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(data.skillGraph).map(([skill, info]: [string, any]) => (
                <div key={skill} className="p-4 glass rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{skill}</h3>
                    {info.verified && (
                      <Badge variant="verified" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-secondary">Level</span>
                      <span className="font-medium capitalize">{info.level}</span>
                    </div>
                    <div className="w-full bg-bg-tertiary rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all"
                        style={{ width: `${info.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Trust Score: {info.score}/100
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">
              No skills verified yet. Complete onboarding to add skills!
            </p>
          )}
        </Card>

        {/* Recent Contributions */}
        <Card glass className="p-8" id="contributions">
          <h2 className="text-2xl font-display font-bold mb-6">Recent Contributions</h2>

          {data?.contributions && data.contributions.length > 0 ? (
            <div className="space-y-4">
              {data.contributions.slice(0, 10).map((contribution: any) => (
                <div key={contribution._id} className="p-4 glass rounded-lg flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {contribution.type.replace(/_/g, ' ')}
                        </h3>
                        {contribution.description && (
                          <p className="text-sm text-text-secondary">{contribution.description}</p>
                        )}
                      </div>
                      <Badge variant="verified">+{contribution.reputationEarned} rep</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Impact: {contribution.impactScore}/100
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </div>
                      {contribution.projectId && (
                        <Link
                          href={`/projects/${contribution.projectId._id}`}
                          className="text-accent-cyan hover:underline"
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
              <p className="text-text-secondary mb-4">No contributions yet</p>
              <AnimatedButton href="/projects" variant="primary">
                Start Contributing
              </AnimatedButton>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
