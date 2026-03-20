'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
    Bell,
    CheckCircle,
    XCircle,
    ExternalLink,
    Star,
    Trash2,
    CheckCheck,
    ArrowLeft,
    User,
    Briefcase,
    Clock,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
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
        <div
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '16px',
                transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        >
            {/* Top row */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link href={profileHref} target="_blank" className="flex-shrink-0">
                    <div
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)' }}
                    >
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
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <Link
                            href={profileHref}
                            target="_blank"
                            className="font-semibold text-white hover:text-cyan-400 transition text-sm"
                        >
                            {notif.applicantName || 'Unknown'}
                        </Link>
                        {notif.applicantUsername && (
                            <span className="text-xs text-gray-500">@{notif.applicantUsername}</span>
                        )}
                        {notif.applicantReputation > 0 && (
                            <span className="flex items-center gap-1 text-xs text-cyan-400">
                                <Star className="w-3 h-3" />
                                {notif.applicantReputation}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                        <Briefcase className="w-3 h-3" />
                        <span>Applied for <span className="text-white font-medium">{notif.roleName}</span></span>
                        <span className="text-gray-600">·</span>
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo(notif.createdAt)}</span>
                    </div>

                    {/* Skills preview */}
                    {notif.applicantSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {notif.applicantSkills.slice(0, 5).map((skill: string, i: number) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                        background: 'rgba(6,182,212,0.1)',
                                        border: '1px solid rgba(6,182,212,0.2)',
                                        color: '#67e8f9',
                                    }}
                                >
                                    {skill}
                                </span>
                            ))}
                            {notif.applicantSkills.length > 5 && (
                                <span className="text-xs text-gray-500">+{notif.applicantSkills.length - 5} more</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete button */}
                <button
                    onClick={onDelete}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
                    title="Dismiss notification"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Expand message */}
            {notif.message && (
                <div className="mt-3">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition"
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {expanded ? 'Hide message' : 'View message'}
                    </button>
                    {expanded && (
                        <div
                            className="mt-2 p-3 rounded-xl text-sm italic text-gray-300"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            "{notif.message}"
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
                <button
                    onClick={onAccept}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition"
                    style={{
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#4ade80',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                </button>
                <button
                    onClick={onReject}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition"
                    style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <XCircle className="w-4 h-4" />
                    Reject
                </button>
                <Link
                    href={profileHref}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition"
                    style={{
                        background: 'rgba(139,92,246,0.1)',
                        border: '1px solid rgba(139,92,246,0.25)',
                        color: '#c4b5fd',
                    }}
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Profile
                </Link>
            </div>
        </div>
    );
}

// ── Status notification card ──────────────────────────────────────────────────
function StatusCard({ notif, onDelete }: { notif: any; onDelete: () => void }) {
    const isAccepted = notif.type === 'application_accepted';
    return (
        <div
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{
                background: isAccepted ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${isAccepted ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
        >
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: isAccepted ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)' }}
            >
                {isAccepted
                    ? <CheckCircle className="w-5 h-5 text-green-400" />
                    : <XCircle className="w-5 h-5 text-red-400" />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white mb-0.5">
                    {isAccepted ? '🎉 Application Accepted!' : 'Application Update'}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                    {notif.roleName} · <span className="text-gray-300">{notif.projectName}</span>
                </p>
                {notif.message && (
                    <p className="text-xs text-gray-500 italic">"{notif.message}"</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-600">{timeAgo(notif.createdAt)}</span>
                    <Link
                        href={`/projects/${toId(notif.projectId)}`}
                        className="text-xs text-cyan-400 hover:underline"
                    >
                        View Project →
                    </Link>
                </div>
            </div>
            <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
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

    // Live notifications
    const handleLive = useCallback((n: any) => {
        setNotifications(prev => [n, ...prev]);
        toast.success(
            n.type === 'application_received'
                ? `${n.applicantName} applied for ${n.roleName}`
                : n.message || 'New notification',
            { icon: '🔔' }
        );
    }, []);
    useNotifications(user?._id, handleLive);

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
                // Remove notification from local state immediately
                setNotifications(prev => prev.filter(n => toId(n._id) !== toId(notif._id)));
                toast.success(
                    action === 'accept'
                        ? `${notif.applicantName} accepted for ${notif.roleName}! 🎉`
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
        toast.success('All marked as read');
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
                <div className="text-xl text-cyan-400 animate-pulse">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative">
            <FlickeringGrid
                className="absolute inset-0 z-0"
                squareSize={4}
                gridGap={6}
                color="#06b6d4"
                maxOpacity={0.15}
                flickerChance={0.07}
            />

            {/* Navbar */}
            <nav
                className="sticky top-0 z-50"
                style={{ background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
            >
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <Link href="/" className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                            OpenGuild
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/10"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all read
                            </button>
                        )}
                        <Link
                            href="/profile"
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/10"
                        >
                            <User className="w-4 h-4" />
                            Profile
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(139,92,246,0.2))', border: '1px solid rgba(6,182,212,0.3)' }}
                        >
                            <Bell className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Notifications</h1>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    {[
                        { key: 'pending', label: 'Applications', count: pending.length },
                        { key: 'status', label: 'My Updates', count: statusNotifs.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: activeTab === tab.key ? 'rgba(6,182,212,0.15)' : 'transparent',
                                color: activeTab === tab.key ? '#22d3ee' : '#6b7280',
                                border: activeTab === tab.key ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                            }}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span
                                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                    style={{
                                        background: activeTab === tab.key ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.1)',
                                        color: activeTab === tab.key ? '#22d3ee' : '#9ca3af',
                                    }}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Applications tab ── */}
                {activeTab === 'pending' && (
                    <div>
                        {Object.keys(byProject).length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">No pending applications</p>
                            </div>
                        ) : (
                            Object.values(byProject).map(group => (
                                <div key={group.projectId} className="mb-8">
                                    {/* Project header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500" />
                                            <h2 className="font-semibold text-white">{group.projectName}</h2>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9' }}
                                            >
                                                {group.notifs.length} applicant{group.notifs.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/projects/${group.projectId}`}
                                            className="text-xs text-gray-500 hover:text-cyan-400 transition flex items-center gap-1"
                                        >
                                            View project <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {/* Applicant cards */}
                                    <div className="space-y-3">
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
                    <div>
                        {statusNotifs.length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">No updates yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {statusNotifs.map(notif => (
                                    <StatusCard
                                        key={toId(notif._id)}
                                        notif={notif}
                                        onDelete={() => handleDelete(toId(notif._id))}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Toaster position="top-right" />
        </div>
    );
}