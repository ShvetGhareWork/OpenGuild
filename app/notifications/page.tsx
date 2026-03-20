'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    Bell,
    CheckCircle,
    XCircle,
    ExternalLink,
    Star,
    Trash2,
    CheckCheck,
    Briefcase,
    Clock,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { API_URL, getBackendUrl } from '@/lib/api';
import { useNotifications } from '@/hooks/useSocket';

// ── Helper ────────────────────────────────────────────────────────────────────
function toId(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val._id) return String(val._id);
    return String(val);
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Applicant Card ────────────────────────────────────────────────────────────
function ApplicantCard({
    notif,
    onAccept,
    onReject,
    onDelete,
    loading,
}: {
    notif: any;
    onAccept: () => void;
    onReject: () => void;
    onDelete: () => void;
    loading: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const profileHref = `/profile/${toId(notif.applicantId) || notif.applicantUsername}`;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/30 transition-all">
            {/* Top row */}
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <Link href={profileHref} target="_blank" className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-lg">
                        {notif.applicantAvatar ? (
                            <img
                                src={notif.applicantAvatar.startsWith('http')
                                    ? notif.applicantAvatar
                                    : `${getBackendUrl()}${notif.applicantAvatar}`}
                                alt={notif.applicantName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            notif.applicantName?.[0]?.toUpperCase() || '?'
                        )}
                    </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                            href={profileHref}
                            target="_blank"
                            className="font-bold text-white hover:text-cyan-400 transition text-sm uppercase tracking-tight"
                        >
                            {notif.applicantName || 'Unknown Builder'}
                        </Link>
                        {notif.applicantUsername && (
                            <span className="text-[10px] font-bold text-gray-600">@{notif.applicantUsername}</span>
                        )}
                        {notif.applicantReputation > 0 && (
                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-black">
                                <Star className="w-3 h-3 mr-1" />
                                {notif.applicantReputation}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                           <Briefcase className="w-3 h-3" />
                           Applied for <span className="text-white">{notif.roleName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <Clock className="w-3 h-3" />
                           {timeAgo(notif.createdAt)}
                        </div>
                    </div>
                </div>

                {/* Dismiss button */}
                <button
                    onClick={onDelete}
                    className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
                    title="Dismiss notification"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Expand message */}
            {notif.message && (
                <div className="mt-4">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition"
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? 'Hide Application Message' : 'View Application Message'}
                    </button>
                    {expanded && (
                        <div className="mt-3 p-4 rounded-xl text-sm italic text-gray-400 bg-black/40 border border-white/5 leading-relaxed">
                            "{notif.message}"
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
                <button
                    onClick={onAccept}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                    <CheckCircle className="w-4 h-4" />
                    Accept Builder
                </button>
                <button
                    onClick={onReject}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <Link
                    href={profileHref}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition border border-white/10 bg-white/5 text-gray-400 hover:text-white"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}

// ── Status notification card ──────────────────────────────────────────────────
function StatusCard({ notif, onDelete }: { notif: any; onDelete: () => void }) {
    const isAccepted = notif.type === 'application_accepted';
    return (
        <div className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
            isAccepted ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-900/10' : 'bg-red-500/5 border-red-500/20 shadow-lg shadow-red-900/10'
        }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isAccepted ? 'bg-emerald-500/20 shadow-inner' : 'bg-red-500/20 shadow-inner'
            }`}>
                {isAccepted
                    ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                    : <XCircle className="w-6 h-6 text-red-400" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white mb-1 uppercase tracking-tight">
                    {isAccepted ? '🎉 Application Accepted!' : 'Application Declined'}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                   <span className="text-white">{notif.roleName}</span>
                   <span className="text-gray-700">·</span>
                   <span className="text-cyan-400/60">{notif.projectName}</span>
                </div>
                {notif.message && (
                    <p className="text-xs text-gray-500 italic mb-3">"{notif.message}"</p>
                )}
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{timeAgo(notif.createdAt)}</span>
                    <Link
                        href={`/projects/${toId(notif.projectId)}`}
                        className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1.5"
                    >
                        View Project <ExternalLink className="w-3 h-3" />
                    </Link>
                </div>
            </div>
            <button
                onClick={onDelete}
                className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'status'>('pending');

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) { router.push('/login'); return; }

            try {
                const [userRes, notifRes] = await Promise.all([
                    fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const userData = await userRes.json();
                const notifData = await notifRes.json();

                if (userData.success) setUser(userData.data);
                if (notifData.success) setNotifications(notifData.data.notifications);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    // ── Accept / Reject ─────────────────────────────────────────────────────────
    const handleAction = async (notif: any, action: 'accept' | 'reject') => {
        const token = localStorage.getItem('auth_token');
        const projectId = toId(notif.projectId);
        const applicationId = toId(notif.applicationId);

        if (!projectId || !applicationId) {
            toast.error('Missing application data — please refresh');
            return;
        }

        setActionLoading(toId(notif._id));
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/applications/${applicationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (data.success) {
                setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
                toast.success(
                    action === 'accept'
                        ? `${notif.applicantName} accepted! 🎉`
                        : `Application from ${notif.applicantName} rejected`
                );
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Delete notification ─────────────────────────────────────────────────────
    const handleDelete = async (notifId: string) => {
        const token = localStorage.getItem('auth_token');
        try {
            await fetch(`${API_URL}/notifications/${notifId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(prev => prev.filter(n => toId(n._id) !== notifId));
        } catch {
            toast.error('Could not delete notification');
        }
    };

    // ── Mark all read ───────────────────────────────────────────────────────────
    const markAllRead = async () => {
        const token = localStorage.getItem('auth_token');
        await fetch(`${API_URL}/notifications/mark-all-read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All caught up!');
    };

    // ── Partition ───────────────────────────────────────────────────────────────
    const pending = notifications.filter(n => n.type === 'application_received');
    const statusNotifs = notifications.filter(n =>
        n.type === 'application_accepted' || n.type === 'application_rejected'
    );

    // Group pending by project
    const byProject: Record<string, { projectName: string; projectId: string; notifs: any[] }> = {};
    pending.forEach(n => {
        const pid = toId(n.projectId);
        if (!byProject[pid]) {
            byProject[pid] = { projectName: n.projectName || 'Unknown Project', projectId: pid, notifs: [] };
        }
        byProject[pid].notifs.push(n);
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse font-bold tracking-widest uppercase">
                    Syncing...
                </div>
            </div>
        );
    }

    return (
        <MainLayout gridColor="#06b6d4">
            <main className="max-w-4xl mx-auto px-6 py-12 relative z-10 w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <Bell className="w-6 h-6 text-cyan-400" />
                           <h1 className="text-4xl font-display font-bold text-white tracking-tight">Updates</h1>
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            {unreadCount > 0 ? `${unreadCount} unread items remaining` : 'Your inbox is clear'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 text-[10px] font-black text-cyan-400 hover:text-white transition px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 uppercase tracking-widest w-fit"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as clear
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mb-10">
                    {[
                        { key: 'pending', label: 'Builder Apps', count: pending.length },
                        { key: 'status', label: 'My Progress', count: statusNotifs.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.key 
                                    ? 'bg-cyan-600 text-white shadow-lg' 
                                    : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                                    activeTab === tab.key ? 'bg-black/20 text-white' : 'bg-white/10 text-gray-500'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Applications tab ── */}
                {activeTab === 'pending' && (
                    <div className="space-y-12">
                        {Object.keys(byProject).length === 0 ? (
                            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <Bell className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending applications found</p>
                            </div>
                        ) : (
                            Object.values(byProject).map(group => (
                                <div key={group.projectId} className="space-y-6">
                                    {/* Project header */}
                                    <div className="flex items-center justify-between group/pheader">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                            <div>
                                               <h2 className="font-black text-white text-lg tracking-tight uppercase">{group.projectName}</h2>
                                               <p className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">{group.notifs.length} PENDING APP{group.notifs.length > 1 ? 'S' : ''}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/projects/${group.projectId}`}
                                            className="text-[10px] font-black text-gray-600 hover:text-cyan-400 transition flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            View Project <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>

                                    {/* Applicant cards */}
                                    <div className="grid gap-4">
                                        {group.notifs.map(notif => (
                                            <ApplicantCard
                                                key={toId(notif._id)}
                                                notif={notif}
                                                loading={actionLoading === toId(notif._id)}
                                                onAccept={() => handleAction(notif, 'accept')}
                                                onReject={() => handleAction(notif, 'reject')}
                                                onDelete={() => handleDelete(toId(notif._id))}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ── My Updates tab ── */}
                {activeTab === 'status' && (
                    <div className="space-y-4">
                        {statusNotifs.length === 0 ? (
                            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <CheckCircle className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No project updates yet</p>
                            </div>
                        ) : (
                            statusNotifs.map(notif => (
                                <StatusCard
                                    key={toId(notif._id)}
                                    notif={notif}
                                    onDelete={() => handleDelete(toId(notif._id))}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>
        </MainLayout>
    );
}