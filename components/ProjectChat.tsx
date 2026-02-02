'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button, Card } from '@/components/ui';
import { Send, X } from 'lucide-react';
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(getBackendUrl());
    setSocket(newSocket);

    // Join project room
    newSocket.emit('join-project', { projectId });

    // Listen for new messages
    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch message history
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(
          `${API_URL}/projects/${projectId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    return () => {
      newSocket.close();
    };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    socket.emit('send-message', {
      projectId,
      senderId: userId,
      senderName: userName,
      content: input,
    });

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 glass border-l border-white/20 z-50 flex flex-col backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">Team Chat</h3>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-text-tertiary py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-text-tertiary py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.senderId === userId
                    ? 'bg-accent-cyan/20 text-text-primary'
                    : 'glass text-text-secondary border border-white/10'
                }`}
              >
                {msg.senderId !== userId && (
                  <div className="text-xs text-accent-cyan font-medium mb-1">
                    {msg.senderName}
                  </div>
                )}
                <div className="text-sm break-words">{msg.content}</div>
                <div className="text-xs text-text-tertiary mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 glass rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 border border-white/10"
          />
          <Button size="sm" onClick={sendMessage} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
