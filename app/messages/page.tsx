'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/user-provider';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { Search, MessageSquare } from 'lucide-react';
import ChatWindow from '@/components/Messaging/ChatWindow';
import MainLayout from '@/components/MainLayout';

export default function MessagesPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/conversations`);
        if (res.success) {
          setConversations(res.data.conversations);
          // Only auto-select on desktop initially
          if (window.innerWidth >= 1024 && res.data.conversations.length > 0 && !selectedConv) {
            setSelectedConv(res.data.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchConversations();
  }, [user]);

  const filteredConversations = conversations.filter(c => 
    c.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout gridColor="#22d3ee">
      <div className="flex h-full overflow-hidden relative">
        {/* Sidebar - Hidden on mobile if a conversation is selected */}
        <div className={`
          w-full lg:w-80 border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-xl shrink-0
          ${selectedConv ? 'hidden lg:flex' : 'flex'}
        `}>
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search teams..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-cyan-500 transition-all outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-white/5 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 py-2">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConv(conv)}
                  className={`
                    w-full p-4 flex gap-4 hover:bg-white/5 transition-all text-left group
                    ${selectedConv?._id === conv._id ? 'bg-white/10' : ''}
                  `}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                      {conv.projectName.charAt(0)}
                    </div>
                    {conv.projectStatus === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white truncate text-sm tracking-wide">{conv.projectName}</h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate leading-snug opacity-80">
                      {conv.lastMessage ? conv.lastMessage.content : 'No messages yet...'}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
                <MessageSquare className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-sm text-gray-400">No teams found</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area - Hidden on mobile if NO conversation is selected */}
        <div className={`
          flex-1 flex flex-col relative bg-black/20
          ${!selectedConv ? 'hidden lg:flex' : 'flex'}
        `}>
          {selectedConv ? (
            <ChatWindow 
              conversation={selectedConv} 
              key={selectedConv._id} 
              onBack={() => setSelectedConv(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[url('/grid.svg')] bg-center opacity-30">
              <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-cyan-500/20">
                <MessageSquare className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Your Conversations</h2>
              <p className="text-gray-400 max-w-sm text-lg">
                Select a team from the list to start communicating with your fellow builders.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
