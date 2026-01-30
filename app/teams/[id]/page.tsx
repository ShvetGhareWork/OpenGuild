'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Sparkles, Send, Plus, Users, CheckSquare, MessageSquare, Activity } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('join_team', { teamId: params.id });
    });

    newSocket.on('new_message', (msg) => {
      setTeam((prev: any) => ({
        ...prev,
        messages: [...(prev?.messages || []), msg],
      }));
    });

    newSocket.on('task_updated', (update) => {
      fetchTeam(); // Refresh team data
    });

    return () => {
      newSocket.disconnect();
    };
  }, [params.id]);

  const fetchTeam = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setTeam(data.data);
      }

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

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${params.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });

      const data = await res.json();

      if (data.success) {
        fetchTeam();
        setNewTask({ title: '', description: '', priority: 'medium' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${params.id}/tasks/${taskId}`, {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl gradient-text animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card glass className="p-12 text-center">
          <p className="text-xl text-text-secondary">Team not found</p>
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
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-4xl font-regular font-medium">
               OpenGuild
              </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/projects" className="text-text-secondary hover:text-text-primary transition-colors">
              Projects
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Team Workspace</h1>
            <p className="text-xl text-text-secondary">
              {team.members?.length || 0} members collaborating
            </p>
          </div>
          <div className="flex items-center gap-3">
            {team.members?.slice(0, 5).map((member: any, i: number) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-semibold text-sm"
                title={member.userId?.displayName}
              >
                {member.userId?.displayName?.[0] || 'U'}
              </div>
            ))}
            {team.members?.length > 5 && (
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-sm">
                +{team.members.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'tasks' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('tasks')}
            className="flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Tasks
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('activity')}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Activity
          </Button>
        </div>

        {/* Tasks Tab - Kanban Board */}
        {activeTab === 'tasks' && (
          <div>
            {/* New Task Form */}
            <Card glass className="p-6 mb-8">
              <h3 className="font-semibold mb-4">Create New Task</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-cyan"
                  placeholder="Task title..."
                />
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="glass border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-cyan"
                  placeholder="Description..."
                />
                <div className="flex gap-2">
                  <Select
                    selectedKey={newTask.priority}
                    onSelectionChange={(key) => setNewTask({ ...newTask, priority: key as string })}
                    className="flex-1"
                  >
                    <SelectTrigger className="flex-1 glass border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-cyan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover>
                      <SelectListBox>
                        <SelectItem id="low">Low</SelectItem>
                        <SelectItem id="medium">Medium</SelectItem>
                        <SelectItem id="high">High</SelectItem>
                      </SelectListBox>
                    </SelectPopover>
                  </Select>
                  <Button onClick={createTask} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Kanban Board */}
            <div className="grid md:grid-cols-4 gap-6">
              {Object.entries(tasksByStatus).map(([status, tasks]: [string, any]) => (
                <Card key={status} glass className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold capitalize">{status.replace('-', ' ')}</h3>
                    <Badge variant="status">{tasks.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task: any) => (
                      <div key={task._id} className="p-3 glass rounded-lg">
                        <h4 className="font-medium mb-2">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-text-secondary mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              task.priority === 'high' ? 'verified' :
                              task.priority === 'medium' ? 'status' : 'skill'
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <Select
                            selectedKey={task.status}
                            onSelectionChange={(key) => updateTaskStatus(task._id, key as string)}
                            className="text-xs"
                          >
                            <SelectTrigger className="text-xs glass border border-white/10 rounded px-2 py-1 focus:outline-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectPopover>
                              <SelectListBox>
                                <SelectItem id="todo">To Do</SelectItem>
                                <SelectItem id="in-progress">In Progress</SelectItem>
                                <SelectItem id="review">Review</SelectItem>
                                <SelectItem id="done">Done</SelectItem>
                              </SelectListBox>
                            </SelectPopover>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <Card glass className="p-6">
            <div className="h-96 overflow-y-auto mb-4 space-y-3">
              {team.messages?.map((msg: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {msg.senderId?.displayName?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{msg.senderId?.displayName || 'Unknown'}</span>
                      <span className="text-xs text-text-tertiary">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 glass border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-cyan"
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Card glass className="p-6">
            <div className="space-y-4">
              {team.activities?.slice(0, 20).map((activity: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 glass rounded-lg">
                  <Activity className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.userId?.displayName || 'Someone'}</span>
                      {' '}{activity.description}
                    </p>
                    <span className="text-xs text-text-tertiary">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!team.activities || team.activities.length === 0) && (
                <p className="text-center text-text-secondary py-8">No activity yet</p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
