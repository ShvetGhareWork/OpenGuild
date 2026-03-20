'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import {
    Users,
    Code2,
    Lightbulb,
    TrendingUp,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

const ROLE_INFO = {
    recruiter: {
        icon: Users,
        title: 'Recruiter',
        description: 'Create projects, hire builders, and manage teams',
        color: 'from-blue-500 to-cyan-500',
        permissions: [
            'Create and manage projects',
            'Review builder applications',
            'Select and hire builders',
            'Request mentors for projects',
            'Monitor project progress'
        ]
    },
    builder: {
        icon: Code2,
        title: 'Builder',
        description: 'Apply to projects and build amazing products',
        color: 'from-green-500 to-emerald-500',
        permissions: [
            'Browse available projects',
            'Apply to projects',
            'Build assigned projects',
            'Submit progress and deliverables',
            'Earn reputation and tokens'
        ]
    },
    mentor: {
        icon: Lightbulb,
        title: 'Mentor',
        description: 'Guide projects and provide expert feedback',
        color: 'from-purple-500 to-pink-500',
        permissions: [
            'Accept mentor requests',
            'Review project progress',
            'Provide expert feedback',
            'Guide builders and teams',
            'Build your mentorship reputation'
        ]
    },
    investor: {
        icon: TrendingUp,
        title: 'Investor',
        description: 'Invest in promising projects and track ROI',
        color: 'from-orange-500 to-red-500',
        permissions: [
            'View approved projects',
            'Invest in projects',
            'Track investment ROI',
            'Participate in bidding (coming soon)',
            'Monitor project success'
        ]
    }
};

export default function RoleSelectionPage() {
    const router = useRouter();
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['builder']);
    const [activeRole, setActiveRole] = useState('builder');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleRole = (role: string) => {
        if (selectedRoles.includes(role)) {
            if (selectedRoles.length > 1) {
                const newRoles = selectedRoles.filter(r => r !== role);
                setSelectedRoles(newRoles);
                if (activeRole === role) {
                    setActiveRole(newRoles[0]);
                }
            }
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${API_URL}/roles/confirm-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    roles: selectedRoles,
                    activeRole
                })
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/dashboard`);
            } else {
                setError(data.error?.message || 'Failed to confirm role selection');
            }
        } catch (err) {
            console.error('Role confirmation error:', err);
            setError('Failed to confirm role selection');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
             {/* Flickering Grid Background */}
            <FlickeringGrid
                className="z-0 absolute inset-0 w-full h-full"
                squareSize={4}
                gridGap={6}
                color="#a855f7"
                maxOpacity={0.2}
                flickerChance={0.1}
            />

            <div className="max-w-6xl w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-16 px-4">
                    <h1 className="text-4xl md:text-7xl font-display font-bold mb-6 tracking-tight text-white uppercase italic">
                        Select Your{' '}
                        <span className="bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
                            Domain
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-bold uppercase tracking-[0.2em]">
                        Define your territory in the OpenGuild ecosystem
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {Object.entries(ROLE_INFO).map(([roleKey, roleData]) => {
                        const Icon = roleData.icon;
                        const isSelected = selectedRoles.includes(roleKey);
                        const isActive = activeRole === roleKey;

                        return (
                            <div
                                key={roleKey}
                                onClick={() => toggleRole(roleKey)}
                                className={`
                                    relative p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 group overflow-hidden
                                    ${isSelected
                                        ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                    }
                                `}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute top-6 right-6 z-20">
                                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shadow-lg">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`
                                    w-16 h-16 rounded-2xl bg-gradient-to-br ${roleData.color} 
                                    flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500
                                `}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{roleData.title}</h3>
                                <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed uppercase tracking-widest">{roleData.description}</p>

                                {/* Permissions */}
                                <ul className="space-y-3 mb-8">
                                    {roleData.permissions.map((permission, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                            <span className="text-violet-500 mt-0.5">•</span>
                                            <span>{permission}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Active Role Selector */}
                                {isSelected && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveRole(roleKey);
                                        }}
                                        className={`
                                            w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                            ${isActive
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-800 text-white shadow-lg'
                                                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                    >
                                        {isActive ? 'Primary Path' : 'Set as Primary'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center font-bold text-xs uppercase tracking-widest animate-pulse">
                        {error}
                    </div>
                )}

                {/* Confirm Button */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={handleConfirm}
                        disabled={loading || selectedRoles.length === 0}
                        className="
                            relative px-12 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.3em]
                            hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-500
                            disabled:opacity-20 disabled:cursor-not-allowed
                            flex items-center gap-4
                        "
                    >
                        {loading ? 'Processing...' : 'Enter the Grid'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <p className="text-sm text-gray-700 font-black uppercase tracking-widest mt-10">
                        Sector authorized for {selectedRoles.length} active domain{selectedRoles.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
