'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Coins, TrendingUp, TrendingDown, Calendar, Gift, ShoppingBag, LogOut, UserIcon, Zap, Trophy, Code2, Target, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedButton } from '@/components/ui/animated-button';
import { API_URL } from '@/lib/api';

export default function TokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchTokenData();
  }, []);

  const fetchTokenData = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tokens/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (result.success) {
        setData(result.data);
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
        <div className="text-2xl gradient-text animate-pulse">Loading tokens...</div>
      </div>
    );
  }

  const earningOptions = [
    { reason: 'Complete a milestone', amount: 100, icon: Gift },
    { reason: 'Host mentorship session', amount: 50, icon: Gift },
    { reason: 'Win hackathon', amount: 500, icon: Gift },
  ];

  const spendingOptions = [
    { reason: 'Promote project (7 days)', amount: 50, feature: 'promote_project', icon: ShoppingBag },
    { reason: 'Premium mentor access', amount: 100, feature: 'premium_mentor', icon: ShoppingBag },
    { reason: 'Profile boost', amount: 75, feature: 'profile_boost', icon: ShoppingBag },
    { reason: 'Advanced analytics', amount: 150, feature: 'advanced_analytics', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-black relative">
      {/* Flickering Grid Background */}
      <FlickeringGrid
        className="z-0 absolute inset-0 w-full h-full"
        squareSize={4}
        gridGap={6}
        color="#ec4899"
        maxOpacity={0.3}
        flickerChance={0.1}
      />

      {/* ================= NAVBAR ================= */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Header */}
          <div className="flex items-center justify-between py-4 lg:hidden">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="text-gray-300 hover:text-white h-10 w-10 p-0"
            >
              ☰
            </Button>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden lg:flex items-center justify-between py-2">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>

            <div className="flex items-center gap-6">
              {['Dashboard', 'Projects', 'Reputation', 'Tokens', 'Matching', 'Profile'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-gray-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  {item}
                </Link>
              ))}

              <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_id'); router.push('/'); }} className="text-gray-400 hover:text-white ml-4">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95
    border-r border-white/10 shadow-2xl backdrop-blur-xl transform transition-transform duration-300
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative z-10 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                OpenGuild
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white text-2xl transition"
              >
                ✕
              </button>
            </div>

            {/* Nav */}
            <nav className="space-y-3 flex-1">
              {[
                { name: 'Dashboard', path: '/dashboard', icon: <Target className="w-5 h-5" /> },
                { name: 'Projects', path: '/projects', icon: <Code2 className="w-5 h-5" /> },
                { name: 'Reputation', path: '/reputation', icon: <Trophy className="w-5 h-5" /> },
                { name: 'Tokens', path: '/tokens', icon: <Zap className="w-5 h-5" /> },
                { name: 'Matching', path: '/matching', icon: <Users className="w-5 h-5" /> },
                { name: 'Profile', path: '/profile', icon: <UserIcon className="w-5 h-5" /> },
              ].map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`group flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all
              ${isActive
                        ? 'bg-white/15 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <span
                      className={`transition group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-gray-400'
                        }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('user_id'); router.push('/'); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">
            Skill <span className="">Tokens</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Earn tokens by contributing, spend them to unlock premium features
          </p>
        </div>

        {/* Balance Overview - Bento Grid */}
        <BentoGrid className="lg:grid-rows-3 mb-12">
          {/* Token Balance - Large Card */}
          <BentoCard
            name="Token Balance"
            description={`${data?.balance || 0} tokens available to spend`}
            Icon={Coins}
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
            cta="View Transactions"
            onClick={() => document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2"
          />

          {/* Lifetime Earned - Medium Card */}
          <BentoCard
            name="Lifetime Earned"
            description={`+${data?.lifetimeEarned || 0} tokens from contributions`}
            Icon={TrendingUp}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-cyan/10" />
            }
            cta="How to Earn"
            onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2"
          />

          {/* Lifetime Spent - Medium Card */}
          <BentoCard
            name="Lifetime Spent"
            description={`-${data?.lifetimeSpent || 0} tokens on premium features`}
            Icon={TrendingDown}
            background={
              <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/10 via-transparent to-accent-violet/10" />
            }
            cta="View Features"
            onClick={() => document.getElementById('spend')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4"
          />

          {/* How to Earn - Small Card */}
          <BentoCard
            name="Earn Tokens"
            description="Complete milestones, mentor others, win hackathons"
            Icon={Gift}
            background={
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 via-transparent to-accent-yellow/10" />
                <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent-green/20 rounded-full blur-3xl" />
              </div>
            }
            cta="See All Ways"
            onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
          />

          {/* Premium Features - Medium Card */}
          <BentoCard
            name="Premium Features"
            description="Unlock project promotion, mentorship, analytics & more"
            Icon={ShoppingBag}
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
            cta="Browse Features"
            onClick={() => document.getElementById('spend')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4"
          />
        </BentoGrid>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* How to Earn */}
          <Card glass className="p-8" id="earn">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-accent-green" />
              How to Earn Tokens
            </h2>
            <div className="space-y-4">
              {earningOptions.map((option, i) => (
                <div key={i} className="p-4 glass rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <option.icon className="w-8 h-8 text-accent-green" />
                    <span className="font-medium">{option.reason}</span>
                  </div>
                  <Badge variant="verified">+{option.amount} tokens</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* How to Spend */}
          <Card glass className="p-8" id="spend">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-accent-violet" />
              Premium Features
            </h2>
            <div className="space-y-4">
              {spendingOptions.map((option, i) => (
                <div key={i} className="p-4 glass rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.reason}</span>
                    <Badge variant="tech">{option.amount} tokens</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    disabled={data?.balance < option.amount}
                  >
                    {data?.balance < option.amount ? 'Insufficient Tokens' : 'Unlock'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card glass className="p-8" id="transactions">
          <h2 className="text-2xl font-display font-bold mb-6">Transaction History</h2>

          {data?.transactions && data.transactions.length > 0 ? (
            <div className="space-y-3">
              {data.transactions.map((tx: any) => (
                <div key={tx._id} className="p-4 glass rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {tx.type === 'earn' ? (
                      <TrendingUp className="w-8 h-8 text-accent-green" />
                    ) : (
                      <TrendingDown className="w-8 h-8 text-accent-pink" />
                    )}
                    <div>
                      <div className="font-semibold capitalize">
                        {tx.reason.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm text-text-tertiary flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${tx.type === 'earn' ? 'text-accent-green' : 'text-accent-pink'
                      }`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Balance: {tx.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">No transactions yet</p>
              <AnimatedButton href="/projects" variant="primary">
                Start Earning Tokens
              </AnimatedButton>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
