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
            // Must have at least one role
            if (selectedRoles.length > 1) {
                const newRoles = selectedRoles.filter(r => r !== role);
                setSelectedRoles(newRoles);
                // If active role was removed, switch to first available
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
                // Redirect to appropriate dashboard
                router.push(`/dashboard/${activeRole}`);
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
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Choose Your{' '}
                        <span className="bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent">
                            Role
                        </span>
                    </h1>
                    <p className="text-xl text-text-secondary">
                        Select one or more roles. You can switch between them anytime.
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {Object.entries(ROLE_INFO).map(([roleKey, roleData]) => {
                        const Icon = roleData.icon;
                        const isSelected = selectedRoles.includes(roleKey);
                        const isActive = activeRole === roleKey;

                        return (
                            <div
                                key={roleKey}
                                onClick={() => toggleRole(roleKey)}
                                className={`
                  relative p-6 rounded-2xl border-2 cursor-pointer transition-all
                  ${isSelected
                                        ? 'border-accent-cyan bg-white/5 shadow-lg'
                                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                    }
                `}
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle2 className="w-6 h-6 text-accent-cyan" />
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`
                  w-16 h-16 rounded-xl bg-gradient-to-br ${roleData.color} 
                  flex items-center justify-center mb-4
                `}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-2xl font-bold mb-2">{roleData.title}</h3>
                                <p className="text-text-secondary mb-4">{roleData.description}</p>

                                {/* Permissions */}
                                <ul className="space-y-2 mb-4">
                                    {roleData.permissions.map((permission, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                                            <span className="text-accent-cyan mt-1">•</span>
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
                      w-full py-2 px-4 rounded-lg text-sm font-medium transition-all
                      ${isActive
                                                ? 'bg-gradient-to-r from-accent-cyan to-accent-violet text-white'
                                                : 'bg-white/5 text-text-secondary hover:bg-white/10'
                                            }
                    `}
                                    >
                                        {isActive ? 'Primary Role' : 'Set as Primary'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
                        {error}
                    </div>
                )}

                {/* Confirm Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleConfirm}
                        disabled={loading || selectedRoles.length === 0}
                        className="
              px-8 py-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-violet
              text-white font-semibold text-lg
              hover:shadow-xl hover:scale-105 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
                    >
                        {loading ? 'Confirming...' : 'Continue to Dashboard'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Info */}
                <p className="text-center text-sm text-text-secondary mt-6">
                    You've selected {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''}.
                    {selectedRoles.length > 1 && ' You can switch between them anytime from your dashboard.'}
                </p>
            </div>
        </div>
    );
}
