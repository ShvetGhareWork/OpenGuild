'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Calendar, Gift, ShoppingBag } from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';
import { AnimatedButton } from '@/components/ui/animated-button';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent animate-pulse font-bold">
          Loading tokens...
        </div>
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
    <MainLayout gridColor="#ec4899">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Skill <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">Tokens</span>
          </h1>
          <p className="text-xl text-gray-400">
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
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10" />
            }
            cta="View Transactions"
            onClick={() => document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:row-start-1 lg:row-end-4 lg:col-start-1 lg:col-end-2 border-white/10 bg-white/5"
          />

          {/* Lifetime Earned - Medium Card */}
          <BentoCard
            name="Lifetime Earned"
            description={`+${data?.lifetimeEarned || 0} tokens from contributions`}
            Icon={TrendingUp}
            background={
              <div className="absolute inset-0 bg-emerald-500/5" />
            }
            cta="How to Earn"
            onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2 border-white/10 bg-white/5"
          />

          {/* Lifetime Spent - Medium Card */}
          <BentoCard
            name="Lifetime Spent"
            description={`-${data?.lifetimeSpent || 0} tokens on premium features`}
            Icon={TrendingDown}
            background={
              <div className="absolute inset-0 bg-pink-500/5" />
            }
            cta="View Features"
            onClick={() => document.getElementById('spend')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4 border-white/10 bg-white/5"
          />

          {/* How to Earn - Small Card */}
          <BentoCard
            name="Earn Tokens"
            description="Complete milestones, mentor others, win hackathons"
            Icon={Gift}
            background={
              <div className="absolute inset-0 bg-emerald-500/10" />
            }
            cta="See All Ways"
            onClick={() => document.getElementById('earn')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2 border-white/10 bg-white/5"
          />

          {/* Premium Features - Medium Card */}
          <BentoCard
            name="Premium Features"
            description="Unlock project promotion, mentorship, analytics & more"
            Icon={ShoppingBag}
            background={
              <div className="absolute inset-0 bg-purple-500/10" />
            }
            cta="Browse Features"
            onClick={() => document.getElementById('spend')?.scrollIntoView({ behavior: 'smooth' })}
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4 border-white/10 bg-white/5"
          />
        </BentoGrid>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* How to Earn */}
          <Card glass className="p-8 border-white/10 bg-white/5" id="earn">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
              <Gift className="w-6 h-6 text-emerald-400" />
              How to Earn Tokens
            </h2>
            <div className="space-y-4">
              {earningOptions.map((option, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <option.icon className="w-8 h-8 text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />
                    <span className="font-medium text-gray-300">{option.reason}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">+{option.amount}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* How to Spend */}
          <Card glass className="p-8 border-white/10 bg-white/5" id="spend">
            <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
              Premium Features
            </h2>
            <div className="space-y-4">
              {spendingOptions.map((option, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl group hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-300">{option.reason}</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">{option.amount} tokens</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                    disabled={data?.balance < option.amount}
                  >
                    {data?.balance < option.amount ? 'Insufficient Tokens' : 'Unlock Now'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card glass className="p-8 border-white/10 bg-white/5" id="transactions">
          <h2 className="text-2xl font-display font-bold mb-6 text-white text-center sm:text-left">Transaction History</h2>

          {data?.transactions && data.transactions.length > 0 ? (
            <div className="space-y-3">
              {data.transactions.map((tx: any) => (
                <div key={tx._id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${tx.type === 'earn' ? 'bg-emerald-500/10' : 'bg-pink-500/10'}`}>
                      {tx.type === 'earn' ? (
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-pink-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white capitalize text-sm sm:text-base">
                        {tx.reason.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg sm:text-xl font-black ${tx.type === 'earn' ? 'text-emerald-400' : 'text-pink-400'
                      }`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </div>
                    <div className="text-[10px] text-gray-600 font-bold">
                      BAL: {tx.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-50" />
              <p className="text-gray-500 mb-6 font-medium">Your transaction history is empty</p>
              <Button onClick={() => router.push('/projects')} className="bg-gradient-to-r from-pink-500 to-purple-600 border-0">
                Start Earning Tokens
              </Button>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
