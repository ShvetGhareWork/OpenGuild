'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/providers/user-provider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Code2,
  Trophy,
  Zap,
  Users,
  User as UserIcon,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  ArrowRight
} from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { useNotifications } from '@/hooks/useSocket';
import { fetchWithAuth, API_URL } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Target },
  { name: 'Projects', path: '/projects', icon: Code2 },
  { name: 'Messages', path: '/messages', icon: MessageSquare },
  { name: 'Reputation', path: '/reputation', icon: Trophy },
  { name: 'Tokens', path: '/tokens', icon: Zap },
  { name: 'Matching', path: '/matching', icon: Users },
  { name: 'Profile', path: '/profile', icon: UserIcon },
];

export default function MainLayout({ children, showGrid = true, gridColor = "#00d4ff" }: { children: React.ReactNode, showGrid?: boolean, gridColor?: string }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ================= NOTIFICATIONS LOGIC =================
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const handleLiveNotification = useCallback((n: any) => {
    setNotifications(prev => [n, ...prev]);
    toast.success(n.message || 'New notification', { icon: '🔔', duration: 4000 });
  }, []);
  
  useNotifications(user?._id, handleLiveNotification);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await fetchWithAuth(`${API_URL}/notifications`);
        if (res.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();
  }, [user]);

  const toId = (val: any) => (typeof val === 'object' ? val._id : val);

  const handleAccept = async (notif: any) => {
    const token = localStorage.getItem('auth_token');
    const projectId = toId(notif.projectId);
    const applicationId = toId(notif.applicationId);
    setAccepting(applicationId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Member accepted! 🎉');
        setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
      } else toast.error(data.message || 'Failed to accept');
    } catch { toast.error('Error accepting'); }
    finally { setAccepting(null); }
  };

  const handleReject = async (notif: any) => {
    const token = localStorage.getItem('auth_token');
    const projectId = toId(notif.projectId);
    const applicationId = toId(notif.applicationId);
    setAccepting(applicationId);
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Application rejected');
        setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
      } else toast.error(data.message || 'Failed to reject');
    } catch { toast.error('Error rejecting'); }
    finally { setAccepting(null); }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
      {showGrid && (
        <FlickeringGrid 
          className="absolute inset-0 z-0" 
          squareSize={4} 
          gridGap={6} 
          color={gridColor} 
          maxOpacity={0.2}
        />
      )}

      {/* ================= NAVBAR ================= */}
      <nav className="backdrop-blur-md bg-black/50 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between py-4 lg:hidden">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>
            <div className="flex items-center gap-2">
               {/* Mobile Notifications */}
               <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <Bell className="w-6 h-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-300 hover:text-white h-10 w-10 p-0"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden lg:flex items-center justify-between py-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              OpenGuild
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-6 mr-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                      pathname === item.path 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full text-gray-400 hover:text-white">
                  <Search className="w-5 h-5" />
                </Button>
                
                {/* Notifications Dropdown Container */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold ring-2 ring-black">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[500px] flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <button 
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest"
                              onClick={async () => {
                                const token = localStorage.getItem('auth_token');
                                await fetch(`${API_URL}/notifications/mark-all-read`, {
                                  method: 'PATCH',
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                              }}
                            >
                              Mark all read
                            </button>
                          </div>

                          <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar max-h-[400px]">
                            {notifications.length > 0 ? (
                              notifications.map((notif: any, i: number) => (
                                <div 
                                  key={notif._id || i} 
                                  className={`p-4 rounded-xl border transition-all ${
                                    notif.read ? 'bg-white/5 border-transparent' : 'bg-cyan-500/5 border-cyan-500/20 shadow-lg shadow-cyan-900/10'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`mt-0.5 p-2 rounded-lg ${notif.read ? 'bg-white/5' : 'bg-cyan-500/20'}`}>
                                      <Bell className={`w-4 h-4 ${notif.read ? 'text-gray-500' : 'text-cyan-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-200 leading-snug mb-2 font-medium">
                                        {notif.message || (notif.type === 'application_received' && `New application from ${notif.applicantName || 'Someone'}`)}
                                      </p>
                                      
                                      {notif.type === 'application_received' && notif.applicationId && (
                                        <div className="flex gap-2 mt-3">
                                          <button 
                                            onClick={() => handleAccept(notif)}
                                            disabled={accepting === toId(notif.applicationId)}
                                            className="flex-1 py-1.5 rounded-lg bg-cyan-600 text-white text-[10px] font-bold hover:bg-cyan-500 transition-colors disabled:opacity-50"
                                          >
                                            {accepting === toId(notif.applicationId) ? 'Accepting...' : 'Accept'}
                                          </button>
                                          <button 
                                            onClick={() => handleReject(notif)}
                                            disabled={accepting === toId(notif.applicationId)}
                                            className="flex-1 py-1.5 rounded-lg bg-white/5 text-gray-400 text-[10px] font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                                          >
                                            {accepting === toId(notif.applicationId) ? 'Rejecting...' : 'Reject'}
                                          </button>
                                        </div>
                                      )}
                                      <p className="text-[10px] text-gray-500 mt-2 font-medium flex items-center gap-1.5">
                                        <span className={`w-1 h-1 rounded-full ${notif.read ? 'bg-gray-600' : 'bg-cyan-400'}`} />
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-12 text-center">
                                <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-20" />
                                <p className="text-gray-500 text-xs font-medium">No notifications yet</p>
                              </div>
                            )}
                          </div>

                          <div className="p-3 border-t border-white/10 bg-black/40">
                            <button 
                              onClick={() => { setShowNotifications(false); router.push('/dashboard'); }}
                              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                            >
                              View All Notifications
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-gray-400 hover:text-red-400 ml-4 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE NOTIFICATIONS (Standalone Overlay) ================= */}
      <AnimatePresence>
        {(showNotifications && window.innerWidth < 1024) && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-6 lg:hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <button onClick={() => setShowNotifications(false)} className="p-2 bg-white/5 rounded-full"><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {notifications.map((notif: any) => (
                <div key={notif._id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-sm text-gray-200 mb-4">{notif.message || notif.type}</p>
                  <div className="flex gap-3">
                    {notif.type === 'application_received' && (
                      <>
                        <Button size="sm" onClick={() => handleAccept(notif)} className="flex-1">Accept</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleReject(notif)} className="flex-1">Reject</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex relative z-10 flex-1 overflow-hidden">
        {/* ================= MAIN CONTENT ================= */}
        <div 
          className={`fixed inset-0 z-[70] lg:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
          <div onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <aside className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-r border-white/10 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                  OpenGuild
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => { router.push(item.path); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${
                        active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium tracking-wide">{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition mt-auto"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
        
        {/* Toaster for global notifications */}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}
