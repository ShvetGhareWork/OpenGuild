'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, X, Minimize2, MessageCircle } from 'lucide-react';
import { API_URL, getBackendUrl } from '@/lib/api';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

interface ProjectChatProps {
  projectId: string;
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function ProjectChat({ projectId, userId, userName, onClose }: ProjectChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const minimizedRef = useRef(false);
  const initializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep ref in sync so socket handler never has stale value
  minimizedRef.current = minimized;

  // ── Init socket + fetch history ONCE per projectId ─────────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/projects/${projectId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setMessages(data.data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const socket = io(getBackendUrl(), { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join-project', { projectId });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
      if (minimizedRef.current) setUnreadCount(c => c + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      initializedRef.current = false;
    };
  }, [projectId]);

  // ── Auto-scroll on new messages ────────────────────────────────────────────
  useEffect(() => {
    if (!minimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 40);
    }
  }, [messages, minimized]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', {
      projectId,
      senderId: userId,
      senderName: userName,
      content: input.trim(),
    });
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, projectId, userId, userName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMaximize = () => {
    setMinimized(false);
    setUnreadCount(0);
  };

  // ── Minimized pill ─────────────────────────────────────────────────────────
  if (minimized) {
    return (
      <button
        onClick={handleMaximize}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full
          text-white font-medium text-sm hover:scale-105 active:scale-95 transition-transform"
        style={{ background: 'linear-gradient(135deg,#06b6d4,#8b5cf6)', boxShadow: '0 8px 32px rgba(6,182,212,0.35)' }}
      >
        <MessageCircle className="w-5 h-5" />
        <span>Team Chat</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full
              text-white text-xs font-bold flex items-center justify-center animate-bounce"
            style={{ background: '#ec4899', boxShadow: '0 0 10px rgba(236,72,153,0.6)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // ── Full panel ─────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 flex flex-col"
      style={{
        background: 'rgba(4, 7, 18, 0.98)',
        borderLeft: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 block animate-pulse" />
          <span className="font-semibold text-white text-sm">Team Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            title="Minimize"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-gray-500 animate-pulse">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ opacity: 0.4 }}>
            <MessageCircle className="w-10 h-10 text-gray-500" />
            <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = String(msg.senderId) === String(userId);
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '8px 12px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe
                      ? 'linear-gradient(135deg,rgba(6,182,212,0.22),rgba(139,92,246,0.22))'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isMe ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {!isMe && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#22d3ee', marginBottom: 3 }}>
                      {msg.senderName}
                    </div>
                  )}
                  {/* ✅ explicit white color so text is always visible */}
                  <p style={{ fontSize: '13px', color: '#f1f5f9', wordBreak: 'break-word', lineHeight: 1.55, margin: 0 }}>
                    {msg.content}
                  </p>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(148,163,184,0.55)',
                    marginTop: 3,
                    textAlign: isMe ? 'right' : 'left',
                  }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}
      >
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              // ✅ The key fix — force visible text color
              color: '#ffffff',
              caretColor: '#22d3ee',
              fontSize: '13px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              maxHeight: '100px',
              overflowY: 'auto',
              transition: 'border 0.15s',
            }}
            onFocus={e => { e.target.style.border = '1px solid rgba(6,182,212,0.5)'; }}
            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.14)'; }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              padding: '9px 11px',
              borderRadius: '12px',
              background: input.trim() ? 'linear-gradient(135deg,#06b6d4,#8b5cf6)' : 'rgba(255,255,255,0.08)',
              color: input.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              border: 'none',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.35)', marginTop: 5, textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}