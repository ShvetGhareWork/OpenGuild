'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Target,
    Code2,
    Trophy,
    Zap,
    UserIcon,
    LogOut,
    Menu,
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Target },
    { name: 'Projects', path: '/projects', icon: Code2 },
    { name: 'Reputation', path: '/reputation', icon: Trophy },
    { name: 'Tokens', path: '/tokens', icon: Zap },
    { name: 'Profile', path: '/profile', icon: UserIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* ================= MOBILE TOP BAR ================= */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 bg-black/60 backdrop-blur-xl border-b border-white/10">
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                    OpenGuild
                </span>
                <button onClick={() => setOpen(true)}>
                    <Menu className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* ================= MOBILE DRAWER ================= */}
            <div
                className={`fixed inset-0 z-50 lg:hidden transition ${open ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
            >
                <div
                    onClick={() => setOpen(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                <aside
                    className={`absolute left-0 top-0 h-full w-72 bg-gradient-to-br from-gray-900 via-black to-gray-900
          border-r border-white/10 shadow-2xl backdrop-blur-xl transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="p-6 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                                OpenGuild
                            </span>
                            <button onClick={() => setOpen(false)}>✕</button>
                        </div>

                        {navItems.map((item) => {
                            const active = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        router.push(item.path);
                                        setOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition
                  ${active
                                            ? 'bg-white/10 text-white shadow-md'
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => router.push('/')}
                            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </aside>
            </div>

            {/* ================= DESKTOP SIDEBAR ================= */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-black/60 backdrop-blur-xl border-r border-white/10 z-30">
                <div className="p-6 flex flex-col w-full">
                    <span className="text-2xl font-bold mb-10 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                        OpenGuild
                    </span>

                    {navItems.map((item) => {
                        const active = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.path)}
                                className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition relative overflow-hidden
                ${active
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-cyan-500/10 to-pink-500/10" />
                                <Icon className="w-5 h-5 z-10" />
                                <span className="z-10">{item.name}</span>
                            </button>
                        );
                    })}

                    <button
                        onClick={() => router.push('/')}
                        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
