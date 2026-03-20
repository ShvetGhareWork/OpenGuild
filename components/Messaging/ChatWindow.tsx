import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/components/providers/user-provider';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { Button, Card, Badge } from '@/components/ui';
import VideoCallModal from './VideoCallModal';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle,
  Info,
  X as CloseIcon,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ conversation, onBack }: { conversation: any, onBack?: () => void }) {
  const { user } = useUser();
  const [showInfo, setShowInfo] = useState(false);
  const socket = useSocket(user?._id);
  const { 
    localStream, 
    remoteStream, 
    callStatus, 
    callerName, 
    startCall, 
    answerCall, 
    endCall, 
    cancelIncoming 
  } = useWebRTC(conversation.projectId, user?._id || '');
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/projects/${conversation.projectId}/messages`);
        if (res.success) setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
    
    // Join room
    socket.emit('join-project', { projectId: conversation.projectId, userId: user?._id });

    // Listen for new messages
    const handleNewMessage = (msg: any) => {
      setMessages((prev: any[]) => [...prev, msg]);
    };

    const handleTyping = ({ username }: { username: string }) => {
      setTyping(username);
    };

    const handleStopTyping = () => {
      setTyping(null);
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [conversation.projectId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit('send-message', {
      projectId: conversation.projectId,
      senderId: user?._id,
      senderName: user?.username,
      content: input,
    });

    setInput('');
    socket.emit('stop-typing', { projectId: conversation.projectId, userId: user?._id });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value) {
      socket.emit('typing', { projectId: conversation.projectId, userId: user?._id, username: user?.username });
    } else {
      socket.emit('stop-typing', { projectId: conversation.projectId, userId: user?._id });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex justify-between items-center bg-gray-900/40 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-4">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="ghost" 
              size="sm" 
              className="lg:hidden w-8 h-8 p-0 rounded-full hover:bg-white/10 text-gray-400 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-sm sm:text-base shrink-0">
            {conversation.projectName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-white text-base">{conversation.projectName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500">
              <Circle className="w-2 h-2 fill-current" />
              <span>{typing ? `${typing} is typing...` : 'Active Now'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={startCall}
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-full hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            onClick={startCall}
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 rounded-full hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => setShowInfo(!showInfo)}
            variant="ghost" 
            size="sm" 
            className={`w-10 h-10 p-0 rounded-full hover:bg-white/10 ${showInfo ? 'text-cyan-400 bg-white/5' : 'text-gray-400'} transition-colors`}
          >
            <Info className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Call UI */}
          {callStatus !== 'idle' && (
            <VideoCallModal
              status={callStatus}
              localStream={localStream}
              remoteStream={remoteStream}
              callerName={callerName}
              onAnswer={answerCall}
              onEnd={endCall}
              onCancel={cancelIncoming}
            />
          )}

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('/bubbles.png')] bg-fixed"
          >
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?._id;
              return (
                <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl relative shadow-lg ${
                    isMe 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white rounded-tl-none backdrop-blur-sm'
                  }`}>
                    {!isMe && <span className="text-[10px] font-bold text-cyan-400 mb-1 block uppercase tracking-wider">{msg.senderName}</span>}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex items-start">
                <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none animate-pulse flex gap-1 items-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900/80 backdrop-blur-xl border-t border-white/10">
            <form onSubmit={sendMessage} className="flex items-center gap-3 max-w-7xl mx-auto">
              <Button type="button" variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-cyan-400">
                <Paperclip className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all pr-12"
                />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400">
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim()}
                className="w-12 h-12 p-0 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/20 shadow-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/10 bg-gray-900/50 backdrop-blur-xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">Group Info</h3>
                <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white transition">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-4 ring-4 ring-white/5">
                    {conversation.projectName.charAt(0)}
                  </div>
                  <h4 className="text-xl font-bold text-white text-center mb-2">{conversation.projectName}</h4>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Active Team
                  </Badge>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">About</h5>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Official communication channel for the {conversation.projectName} project. ONLY selected members can chat here.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Team Members ({conversation.participants?.length || 0})
                      </h5>
                    </div>
                    <div className="space-y-3">
                      {conversation.participants?.map((participant: any) => (
                        <div key={participant._id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-cyan-400">
                            {participant.avatar ? (
                              <img src={participant.avatar} alt={participant.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              participant.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {participant.displayName || participant.username}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              Team Member
                            </p>
                          </div>
                          {participant._id === user?._id && (
                            <Badge className="bg-cyan-500/10 text-cyan-400 text-[8px] py-0 px-1">You</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
