'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Github,
  Code2,
  Palette,
  Briefcase,
  Target,
  Linkedin,
  Terminal,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

const SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'JavaScript', 'MongoDB', 'PostgreSQL', 
  'Next.js', 'Vue.js', 'Angular', 'Express', 'Django', 'Flask', 'FastAPI', 
  'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'AWS', 
  'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GraphQL', 'REST APIs', 
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'AI'
];

const ROLES = [
  { value: 'builder', label: 'Builder', icon: Code2, description: 'Forge products and experience' },
  { value: 'mentor', label: 'Mentor', icon: Target, description: 'Guide the next generation' },
  { value: 'investor', label: 'Investor', icon: Briefcase, description: 'Back the masters of code' },
  { value: 'recruiter', label: 'Recruiter', icon: Palette, description: 'Engineer elite squads' },
];

const GOALS = [
  'Learn new skills', 'Build portfolio', 'Get hired', 'Start a startup', 
  'Freelance work', 'Network with builders', 'Mentor others', 'Find co-founder'
];

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('builder');
  const [selectedSkills, setSelectedSkills] = useState<Array<{ name: string; level: string }>>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState({ github: '', leetcode: '', behance: '', linkedin: '', portfolio: '' });
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data;
          if (user.role) setRole(user.role);
          if (user.skills?.length > 0) setSelectedSkills(user.skills);
          if (user.goals?.length > 0) setSelectedGoals(user.goals);
          if (user.externalLinks) setExternalLinks(prev => ({ ...prev, ...user.externalLinks }));
          if (user.bio) setBio(user.bio);
        }
      } catch (err) { console.error(err); }
    };
    fetchUserData();
  }, [router]);

  const toggleSkill = (skillName: string) => {
    const exists = selectedSkills.find((s) => s.name === skillName);
    if (exists) setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName));
    else setSelectedSkills([...selectedSkills, { name: skillName, level: 'intermediate' }]);
  };

  const updateSkillLevel = (skillName: string, level: string) => {
    setSelectedSkills(selectedSkills.map((s) => s.name === skillName ? { ...s, level } : s));
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    else setSelectedGoals([...selectedGoals, goal]);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { router.push('/login'); return; }
      
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, skills: selectedSkills, goals: selectedGoals, externalLinks, bio }),
      });

      if ((await res.json()).success) {
        await fetch(`${API_URL}/users/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ onboardingCompleted: true }),
        });
        router.push('/dashboard');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-6 relative overflow-hidden">
       {/* Flickering Grid Background */}
        <FlickeringGrid
            className="z-0 absolute inset-0 w-full h-full"
            squareSize={4}
            gridGap={6}
            color="#06b6d4"
            maxOpacity={0.2}
            flickerChance={0.1}
        />

      <div className="max-w-4xl w-full relative z-10 transition-all duration-700">
        {/* Header */}
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-6xl font-display font-black text-white italic tracking-tighter uppercase mb-2">
              Onboarding <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Sequence</span>
           </h1>
           <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">Sector Authorization Level {step}/4</p>
        </div>

        {/* Progress System */}
        <div className="flex gap-2 mb-16 max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/5'}`} />
          ))}
        </div>

        {/* Dynamic Step Content */}
        <Card glass className="p-10 md:p-14 border-white/10 bg-black/40 rounded-[3rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 opacity-5 grayscale group-hover:grayscale-0 transition-all duration-1000">
              <Code2 className="w-64 h-64 text-cyan-500" />
           </div>

           <div className="relative z-10">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-10 border-l-4 border-cyan-500 pl-6">Core Specialization</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center text-center ${role === r.value ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-900/10' : 'border-white/5 bg-white/3 hover:border-white/20'}`}
                    >
                      <r.icon className={`w-12 h-12 mb-4 transition-colors ${role === r.value ? 'text-cyan-400' : 'text-gray-600'}`} />
                      <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{r.label}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{r.description}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setStep(2)} className="w-full mt-12 h-16 bg-white text-black font-extrabold text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all">Synchronize & Proceed →</Button>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 border-l-4 border-cyan-500 pl-6">Arsenal Loadout</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-10 pl-7">Select at least 3 verified technologies</p>
                <div className="flex flex-wrap gap-3 mb-12">
                  {SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      className={`cursor-pointer text-[10px] font-black px-4 py-2 rounded-xl lowercase border transition-all ${selectedSkills.find((s) => s.name === skill) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-gray-600 border-white/5 hover:border-white/20'}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {selectedSkills.length > 0 && (
                  <div className="space-y-4 mb-12">
                    {selectedSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                        <span className="text-xs font-black text-white uppercase tracking-widest pl-2">{skill.name}</span>
                        <div className="flex gap-2">
                          {SKILL_LEVELS.map((level) => (
                            <button
                              key={level}
                              onClick={() => updateSkillLevel(skill.name, level)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${skill.level === level ? 'bg-cyan-600 text-white shadow-lg' : 'bg-black/40 text-gray-700 hover:text-white hover:bg-white/5'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 border border-white/5 hover:border-white/20 text-gray-500 uppercase font-black text-[10px] tracking-widest">Previous</Button>
                  <Button onClick={() => setStep(3)} disabled={selectedSkills.length < 3} className="flex-[2] h-14 bg-white text-black font-extrabold text-xs uppercase tracking-widest">Calibrate Arsenal →</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 border-l-4 border-cyan-500 pl-6">Sector Objectives</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-10 pl-7">Define your progression path</p>
                <div className="flex flex-wrap gap-3 mb-12">
                  {GOALS.map((goal) => (
                    <Badge
                      key={goal}
                      className={`cursor-pointer text-[10px] font-black px-5 py-3 rounded-2xl uppercase tracking-tighter border transition-all ${selectedGoals.includes(goal) ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-white/5 text-gray-600 border-white/5'}`}
                      onClick={() => toggleGoal(goal)}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-6">
                   {[
                     { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
                     { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
                     { key: 'leetcode', label: 'LeetCode', icon: Terminal, placeholder: 'https://leetcode.com/username' },
                     { key: 'behance', label: 'Behance', icon: Palette, placeholder: 'https://behance.net/username' },
                     { key: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'https://yourportfolio.com' },
                   ].map((item) => (
                      <div key={item.key}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <item.icon className="w-3 h-3 text-cyan-500" />
                           {item.label} Link
                        </label>
                        <input
                          type="url"
                          value={externalLinks[item.key as keyof typeof externalLinks]}
                          onChange={(e) => setExternalLinks({ ...externalLinks, [item.key]: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 shadow-inner transition-all hover:border-white/20"
                          placeholder={item.placeholder}
                        />
                      </div>
                   ))}
                </div>

                <div className="flex gap-4 mt-12">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-14 border border-white/5 text-gray-500 uppercase font-black text-[10px] tracking-widest">Previous</Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    disabled={selectedGoals.length === 0 || !externalLinks.github || !externalLinks.linkedin} 
                    className="flex-[2] h-14 bg-white text-black font-extrabold text-xs uppercase tracking-widest disabled:opacity-30"
                  >
                    {!externalLinks.github || !externalLinks.linkedin ? 'GitHub & LinkedIn Required' : 'Link System →'}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 border-l-4 border-cyan-500 pl-6">Identity Uplink</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-10 pl-7">Final broadcast to the ecosystem</p>
                
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-3xl px-8 py-6 text-sm text-white focus:outline-none focus:border-cyan-500/50 min-h-[180px] leading-relaxed"
                  placeholder="I am a builder specializing in high-performance architectures..."
                  maxLength={500}
                />
                
                <div className="mt-12 p-8 bg-white/5 border border-white/5 rounded-[2rem] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Target className="w-20 h-20 text-cyan-400" />
                   </div>
                   <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">Manifest Summary</h3>
                   <div className="grid grid-cols-2 gap-y-4">
                      <div className="flex flex-col"><span className="text-[9px] font-black uppercase tracking-tighter text-gray-700">Role</span><span className="text-sm font-black text-white uppercase tracking-tight">{role}</span></div>
                      <div className="flex flex-col"><span className="text-[9px] font-black uppercase tracking-tighter text-gray-700">Skills</span><span className="text-sm font-black text-white uppercase tracking-tight">{selectedSkills.length} Verified</span></div>
                      <div className="flex flex-col"><span className="text-[9px] font-black uppercase tracking-tighter text-gray-700">Goals</span><span className="text-sm font-black text-white uppercase tracking-tight">{selectedGoals.length} Targeted</span></div>
                      <div className="flex flex-col"><span className="text-[9px] font-black uppercase tracking-tighter text-gray-700">Links</span><span className="text-sm font-black text-white uppercase tracking-tight">{Object.values(externalLinks).filter(v => v).length} Synchronized</span></div>
                   </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 h-16 border border-white/5 text-gray-500 uppercase font-black text-[10px] tracking-widest">Previous</Button>
                  <Button onClick={handleComplete} disabled={loading} className="flex-[2] h-16 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs uppercase tracking-[0.3em] shadow-lg shadow-cyan-900/20 active:scale-95 transition-all">
                    {loading ? 'FINALIZING...' : 'AUTHORIZE ACCESS →'}
                  </Button>
                </div>
              </div>
            )}
           </div>
        </Card>
      </div>
    </div>
  );
}
