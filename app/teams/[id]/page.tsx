'use client';

import MainLayout from '@/components/MainLayout';
import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Send, Plus, Users, CheckSquare, MessageSquare, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL, getBackendUrl } from '@/lib/api';

export default function TeamWorkspacePage() {
  const params = useParams();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'activity'>('tasks');
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    fetchTeam();

    // Initialize WebSocket
    const newSocket = io(getBackendUrl());
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_team', { teamId: params.id });
    });

    newSocket.on('new_message', (msg) => {
      setTeam((prev: any) => ({
        ...prev,
        messages: [...(prev?.messages || []), msg],
      }));
    });

    newSocket.on('task_updated', () => {
      fetchTeam();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [params.id]);

  const fetchTeam = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/teams/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setTeam(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    const userId = localStorage.getItem('userId');
    socket.emit('send_message', {
      teamId: params.id,
      content: message,
      senderId: userId,
      senderName: 'You',
    });
    setMessage('');
  };

  const createTask = async () => {
    if (!newTask.title) return;
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/teams/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        fetchTeam();
        setNewTask({ title: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const token = localStorage.getItem('auth_token');
    try {
      const res = await fetch(`${API_URL}/teams/${params.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        socket?.emit('update_task', {
          teamId: params.id,
          taskId,
          status,
          updatedBy: localStorage.getItem('userId'),
        });
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent animate-pulse font-bold tracking-widest uppercase">
          Loading Workspace...
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card glass className="p-16 text-center border-white/10 bg-white/5">
          <p className="text-xl text-white font-bold mb-2">Workspace Unavailable</p>
          <p className="text-sm text-gray-500">The team you're looking for was not found.</p>
        </Card>
      </div>
    );
  }

  const tasksByStatus = {
    todo: team.tasks?.filter((t: any) => t.status === 'todo') || [],
    'in-progress': team.tasks?.filter((t: any) => t.status === 'in-progress') || [],
    review: team.tasks?.filter((t: any) => t.status === 'review') || [],
    done: team.tasks?.filter((t: any) => t.status === 'done') || [],
  };

  return (
    <MainLayout gridColor="#8b5cf6">
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Team Workspace</h1>
            <p className="text-xl text-gray-400">
               <span className="text-violet-400 font-bold">{team.members?.length || 0} Builders</span> collaborating on <span className="text-white italic">{team.projectId?.name || 'Project'}</span>
            </p>
          </div>
          <div className="flex -space-x-4">
            {team.members?.slice(0, 8).map((member: any, i: number) => (
              <div
                key={i}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 border-4 border-black flex items-center justify-center font-black text-white shadow-xl relative group cursor-pointer"
                title={member.userId?.displayName}
              >
                {member.userId?.displayName?.[0] || 'U'}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </div>
            ))}
            {team.members?.length > 8 && (
              <div className="w-12 h-12 rounded-2xl bg-white/5 border-4 border-black flex items-center justify-center text-xs font-black text-gray-400 backdrop-blur-xl">
                +{team.members.length - 8}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mb-10 overflow-x-auto max-w-full">
          {[
            { key: 'tasks', label: 'Kanban', icon: CheckSquare },
            { key: 'chat', label: 'Team Chat', icon: MessageSquare },
            { key: 'activity', label: 'Timeline', icon: Activity },
          ].map((tab) => (
             <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key 
                  ? 'bg-violet-600 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="animate-fade-in">
            {/* New Task Form */}
            <Card glass className="p-8 mb-10 border-white/10 bg-white/5 rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Plus className="w-24 h-24 text-violet-400 rotate-12" />
              </div>
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight relative z-10">Deploy New Task</h3>
              <div className="grid md:grid-cols-12 gap-4 relative z-10">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="md:col-span-4 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-violet-500/50 text-white placeholder:text-gray-700"
                  placeholder="What needs to be done?"
                />
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="md:col-span-5 bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-violet-500/50 text-white placeholder:text-gray-700"
                  placeholder="Add more context (optional)..."
                />
                <div className="md:col-span-3 flex gap-2">
                  <Select
                    selectedKey={newTask.priority}
                    onSelectionChange={(key) => setNewTask({ ...newTask, priority: key as string })}
                    className="flex-1"
                  >
                    <SelectTrigger className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3 text-sm focus:outline-none flex justify-between items-center text-gray-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover>
                      <SelectListBox className="bg-gray-950 border border-white/10 rounded-xl p-1 overflow-hidden">
                        <SelectItem id="low" className="p-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">Low</SelectItem>
                        <SelectItem id="medium" className="p-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">Medium</SelectItem>
                        <SelectItem id="high" className="p-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">High</SelectItem>
                      </SelectListBox>
                    </SelectPopover>
                  </Select>
                  <Button onClick={createTask} className="bg-violet-600 hover:bg-violet-500 rounded-2xl px-5 transition-all">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Kanban Board */}
            <div className="grid md:grid-cols-4 gap-6">
              {Object.entries(tasksByStatus).map(([status, tasks]: [string, any]) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{status.replace('-', ' ')}</h3>
                    <Badge className="bg-white/5 text-gray-600 border-white/5 text-[10px]">{tasks.length}</Badge>
                  </div>
                  <div className="space-y-4">
                    {tasks.map((task: any) => (
                      <Card key={task._id} glass className="p-5 border-white/5 bg-white/5 hover:border-violet-500/20 transition-all rounded-2xl group">
                        <h4 className="font-bold text-white text-sm mb-2 group-hover:text-violet-400 transition-colors uppercase tracking-tight">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <Badge
                            className={`text-[9px] font-black uppercase tracking-tighter ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              task.priority === 'medium' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-gray-500/10 text-gray-500 border-white/10'
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          <Select
                            selectedKey={task.status}
                            onSelectionChange={(key) => updateTaskStatus(task._id, key as string)}
                          >
                            <SelectTrigger className="text-[9px] font-black uppercase text-gray-600 hover:text-white transition flex items-center gap-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectPopover>
                               <SelectListBox className="bg-gray-950 border border-white/10 rounded-xl p-1 overflow-hidden w-32">
                                <SelectItem id="todo" className="p-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">To Do</SelectItem>
                                <SelectItem id="in-progress" className="p-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">Progress</SelectItem>
                                <SelectItem id="review" className="p-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">Review</SelectItem>
                                <SelectItem id="done" className="p-2 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 rounded-lg cursor-pointer">Done</SelectItem>
                              </SelectListBox>
                            </SelectPopover>
                          </Select>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <Card glass className="p-0 border-white/10 bg-white/5 rounded-3xl overflow-hidden animate-fade-in">
            <div className="h-[500px] overflow-y-auto p-8 space-y-6 flex flex-col-reverse">
               <div className="space-y-6">
                {[...(team.messages || [])].reverse().map((msg: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 group/msg">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-lg group-hover/msg:scale-110 transition-transform">
                      {msg.senderId?.displayName?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-white text-xs uppercase tracking-tight">{msg.senderId?.displayName || 'Unknown Builder'}</span>
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 inline-block max-w-[85%] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-black/40 border-t border-white/5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500/50 text-white placeholder:text-gray-700 shadow-inner"
                    placeholder="Brief your team members..."
                  />
                  <Button onClick={sendMessage} className="bg-violet-600 hover:bg-violet-500 rounded-2xl px-8 shadow-lg shadow-violet-900/20 active:scale-95 transition-all">
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
            </div>
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Card glass className="p-8 border-white/10 bg-white/5 rounded-3xl animate-fade-in relative overflow-hidden">
             <div className="absolute -top-10 -right-10 opacity-5 grayscale">
                <Activity className="w-64 h-64 text-violet-400" />
             </div>
             <div className="relative z-10 space-y-6">
              {team.activities?.slice(0, 30).map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-violet-500/20 transition-all group">
                  <div className="w-10 h-10 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                     <Activity className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                      <span className="text-white font-bold uppercase tracking-tight">{activity.userId?.displayName || 'System'}</span>
                      {' '}{activity.description}
                    </p>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2 block">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!team.activities || team.activities.length === 0) && (
                <div className="text-center py-24 opacity-30 grayscale">
                    <Activity className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No activity recorded on chain</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
