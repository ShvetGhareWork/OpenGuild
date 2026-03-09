'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { Users, Code2, Lightbulb, TrendingUp, ChevronDown } from 'lucide-react';

const ROLE_ICONS = {
    recruiter: Users,
    builder: Code2,
    mentor: Lightbulb,
    investor: TrendingUp
};

const ROLE_COLORS = {
    recruiter: 'from-blue-500 to-cyan-500',
    builder: 'from-green-500 to-emerald-500',
    mentor: 'from-purple-500 to-pink-500',
    investor: 'from-orange-500 to-red-500'
};

interface RoleSwitcherProps {
    currentRole: string;
    availableRoles: string[];
    onRoleChange?: (role: string) => void;
}

export default function RoleSwitcher({ currentRole, availableRoles, onRoleChange }: RoleSwitcherProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    const handleSwitchRole = async (newRole: string) => {
        if (newRole === currentRole) {
            setIsOpen(false);
            return;
        }

        setSwitching(true);

        try {
            const token = localStorage.getItem('auth_token');
            let res = await fetch(`${API_URL}/roles/switch-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            let data = await res.json();

            // Auto add role if user doesn't have it yet
            if (!data.success && data.error?.message?.includes("don't have access")) {
                await fetch(`${API_URL}/roles/add-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });

                // Retry switch
                res = await fetch(`${API_URL}/roles/switch-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: newRole })
                });
                data = await res.json();
            }

            if (data.success) {
                setIsOpen(false);
                if (onRoleChange) {
                    onRoleChange(newRole);
                } else {
                    // Fall back to refreshing dashboard if no callback provided
                    router.push('/dashboard');
                    router.refresh();
                }
            }
        } catch (err) {
            console.error('Role switch error:', err);
        } finally {
            setSwitching(false);
        }
    };

    const CurrentIcon = ROLE_ICONS[currentRole as keyof typeof ROLE_ICONS] || Users;

    return (
        <div className="relative">
            {/* Current Role Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
          flex items-center gap-3 px-4 py-2 rounded-xl
          bg-white/5 border border-white/10
          hover:bg-white/10 transition-all
        "
            >
                <div className={`
          w-8 h-8 rounded-lg bg-gradient-to-br ${ROLE_COLORS[currentRole as keyof typeof ROLE_COLORS]}
          flex items-center justify-center
        `}>
                    <CurrentIcon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                    <div className="text-xs text-text-secondary">Current Role</div>
                    <div className="text-sm font-semibold capitalize">{currentRole}</div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="
            absolute top-full mt-2 right-0 z-50
            w-64 p-2 rounded-xl
            bg-bg-secondary border border-white/10
            shadow-2xl
          ">
                        <div className="text-xs text-text-secondary px-3 py-2 font-medium">
                            Switch Role
                        </div>

                        {['builder', 'recruiter', 'mentor', 'investor'].map((role) => {
                            const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
                            const isActive = role === currentRole;

                            return (
                                <button
                                    key={role}
                                    onClick={() => handleSwitchRole(role)}
                                    disabled={switching}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-all
                    ${isActive
                                            ? 'bg-accent-cyan/10 text-accent-cyan'
                                            : 'hover:bg-white/5 text-text-primary'
                                        }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                                >
                                    <div className={`
                    w-8 h-8 rounded-lg bg-gradient-to-br ${ROLE_COLORS[role as keyof typeof ROLE_COLORS]}
                    flex items-center justify-center
                  `}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium capitalize">{role}</div>
                                    </div>
                                    {isActive && (
                                        <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
