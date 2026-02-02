'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState } from 'react';
import { Sparkles, ArrowRight, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Select, SelectItem, SelectListBox, SelectPopover, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL } from '@/lib/api';

const TECH_STACK_OPTIONS = [
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express',
  'Django',
  'Flask',
  'Python',
  'TypeScript',
  'JavaScript',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'TailwindCSS',
];

const ROLE_OPTIONS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'UI/UX Designer',
  'Product Manager',
  'DevOps Engineer',
  'Mobile Developer',
  'Data Scientist',
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vision: '',
    techStack: [] as string[],
    visibility: 'public',
  });
  const [openRoles, setOpenRoles] = useState<Array<{ role: string; skills: string[]; description: string }>>([]);
  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; deadline: string }>>([]);

  const toggleTech = (tech: string) => {
    if (formData.techStack.includes(tech)) {
      setFormData({
        ...formData,
        techStack: formData.techStack.filter((t) => t !== tech),
      });
    } else {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, tech],
      });
    }
  };

  const addRole = () => {
    setOpenRoles([...openRoles, { role: '', skills: [], description: '' }]);
  };

  const updateRole = (index: number, field: string, value: any) => {
    const updated = [...openRoles];
    updated[index] = { ...updated[index], [field]: value };
    setOpenRoles(updated);
  };

  const removeRole = (index: number) => {
    setOpenRoles(openRoles.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', deadline: '' }]);
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to create a project');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          openRoles: openRoles.filter((r) => r.role),
          milestones: milestones.filter((m) => m.title),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error?.message || 'Failed to create project');
        setLoading(false);
        return;
      }

      router.push(`/projects/${data.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-xl sm:text-2xl font-bold">
              OpenGuild
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm sm:text-base"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm sm:text-base"
            >
              Projects
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 sm:mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            Create a <span className="bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-pink bg-clip-text text-transparent text-4xl font-regular font-bold">New Project</span>
          </h1>
          <p className="text-base sm:text-xl text-text-secondary">
            Share your idea and recruit talented builders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Info */}
          <Card glass className="p-5 sm:p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-6">Basic Information</h2>

            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-sm sm:text-base"
                  placeholder="EcoTrack"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-sm sm:text-base"
                  placeholder="Carbon footprint tracking app for individuals"
                  required
                  maxLength={200}
                />
                <p className="text-xs sm:text-sm text-text-tertiary mt-1">
                  {formData.description.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vision (optional)</label>
                <textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                  placeholder="Help 1M people reduce their carbon footprint by 20%..."
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Visibility</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <input
                      type="radio"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="text-accent-cyan"
                    />
                    <span>Public (Open Source)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                    <input
                      type="radio"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="text-accent-cyan"
                    />
                    <span>Private (Stealth Mode)</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card glass className="p-5 sm:p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-3">Tech Stack</h2>
            <p className="text-text-secondary text-sm sm:text-base mb-5">
              Select technologies you'll be using
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {TECH_STACK_OPTIONS.map((tech) => (
                <Badge
                  key={tech}
                  variant={formData.techStack.includes(tech) ? 'verified' : 'skill'}
                  className="cursor-pointer text-xs sm:text-sm px-3 py-1"
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Open Roles */}
          <Card glass className="p-5 sm:p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-display font-bold">Open Roles</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addRole}>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </div>

            {openRoles.length === 0 ? (
              <p className="text-text-secondary text-center py-6 text-sm sm:text-base">
                No roles added yet
              </p>
            ) : (
              <div className="space-y-4">
                {openRoles.map((role, i) => (
                  <div
                    key={i}
                    className="p-4 glass rounded-xl border border-white/10 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeRole(i)}
                      className="absolute top-2 right-2 text-text-tertiary hover:text-accent-red transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-3">
                      <Select
                        selectedKey={role.role || null}
                        onSelectionChange={(key) => updateRole(i, 'role', key as string)}
                        placeholder="Select role..."
                        className="w-full"
                      >
                        <SelectTrigger className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:border-accent-cyan text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectPopover>
                          <SelectListBox>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r} id={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectListBox>
                        </SelectPopover>
                      </Select>

                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => updateRole(i, 'description', e.target.value)}
                        className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:border-accent-cyan text-sm sm:text-base"
                        placeholder="Role description..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Milestones */}
          <Card glass className="p-5 sm:p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-display font-bold">Milestones (optional)</h2>
              <Button type="button" variant="secondary" size="sm" onClick={addMilestone}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {milestones.length === 0 ? (
              <p className="text-text-secondary text-center py-6 text-sm sm:text-base">
                No milestones added yet
              </p>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, i) => (
                  <div
                    key={i}
                    className="p-4 glass rounded-xl border border-white/10 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="absolute top-2 right-2 text-text-tertiary hover:text-accent-red transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                        className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:border-accent-cyan text-sm sm:text-base"
                        placeholder="Milestone title..."
                      />

                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                        className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:border-accent-cyan text-sm sm:text-base"
                        placeholder="Milestone description..."
                        rows={2}
                      />

                      <input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => updateMilestone(i, 'deadline', e.target.value)}
                        className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-2 focus:outline-none focus:border-accent-cyan text-sm sm:text-base"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/projects')}
              className="flex-1 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.description}
              className="flex-1 group text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Create Project'}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
