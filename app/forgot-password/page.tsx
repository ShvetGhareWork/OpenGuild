'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-1/2 -left-1/4 w-[100%] h-[100%] bg-cyan-900/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[100%] h-[100%] bg-purple-900/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            OpenGuild
          </Link>
          <div className="mt-4 text-gray-400">Password Recovery</div>
        </div>

        <Card className="p-8 backdrop-blur-xl bg-white/5 border-white/10">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
                  <Mail className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-gray-400 text-sm">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-6 rounded-xl text-lg relative group overflow-hidden"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 animate-bounce">
                <Send className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-gray-400 mb-8">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
              </p>
              <Button
                variant="outline"
                className="w-full border-white/10 hover:bg-white/5 py-6 rounded-xl"
                onClick={() => setSubmitted(false)}
              >
                Resend link
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="text-gray-400 hover:text-white transition inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </Card>

        <p className="text-center mt-8 text-sm text-gray-500">
          Need help? <Link href="/contact" className="text-cyan-400 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
