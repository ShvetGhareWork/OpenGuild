'use client';

import { Button, Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Github,
  Code2,
  Palette,
  Briefcase,
  Target,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const SKILLS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'JavaScript',
  'MongoDB',
  'PostgreSQL',
  'Next.js',
  'Vue.js',
  'Angular',
  'Express',
  'Django',
  'Flask',
  'FastAPI',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Photoshop',
  'Illustrator',
  'AWS',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Git',
  'GraphQL',
  'REST APIs',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Data Science',
  'AI',
];

const ROLES = [
  {
    value: 'builder',
    label: 'Builder',
    icon: Code2,
    description: 'I want to build projects and gain experience',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    icon: Target,
    description: 'I want to guide and mentor others',
  },
  {
    value: 'investor',
    label: 'Investor',
    icon: Briefcase,
    description: 'I want to discover and fund teams',
  },
  {
    value: 'recruiter',
    label: 'Recruiter',
    icon: Palette,
    description: 'I want to hire talented builders',
  },
];

const GOALS = [
  'Learn new skills',
  'Build portfolio',
  'Get hired',
  'Start a startup',
  'Freelance work',
  'Network with builders',
  'Mentor others',
  'Find co-founder',
];

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // Form state
  const [role, setRole] = useState('builder');
  const [selectedSkills, setSelectedSkills] = useState<Array<{ name: string; level: string }>>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [externalLinks, setExternalLinks] = useState({
    github: '',
    leetcode: '',
    behance: '',
    linkedin: '',
    portfolio: '',
  });
  const [bio, setBio] = useState('');

  // Fetch user data on mount (for OAuth users)
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success && data.data) {
          const user = data.data;
          setUserEmail(user.email || '');
          setUserName(user.displayName || '');
          
          // Pre-fill existing data if any
          if (user.role) setRole(user.role);
          if (user.skills && user.skills.length > 0) setSelectedSkills(user.skills);
          if (user.goals && user.goals.length > 0) setSelectedGoals(user.goals);
          if (user.externalLinks) setExternalLinks({ ...externalLinks, ...user.externalLinks });
          if (user.bio) setBio(user.bio);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };

    fetchUserData();
  }, [router]);

  const toggleSkill = (skillName: string) => {
    const exists = selectedSkills.find((s) => s.name === skillName);
    if (exists) {
      setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, level: 'intermediate' }]);
    }
  };

  const updateSkillLevel = (skillName: string, level: string) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.name === skillName ? { ...s, level } : s
      )
    );
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token'); // Fixed: use 'auth_token' instead of 'token'

      if (!token) {
        alert('You must be logged in to complete onboarding');
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          skills: selectedSkills,
          goals: selectedGoals,
          externalLinks,
          bio,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert('Failed to update profile: ' + (data.error?.message || 'Unknown error'));
        setLoading(false);
        return;
      }

      // Mark onboarding as complete
      await fetch('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          onboardingCompleted: true,
        }),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      alert('Failed to complete onboarding');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4 sm:py-12 sm:px-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/20 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-10 h-10 text-accent-cyan" />
            <span className="text-3xl font-display ">OpenGuild</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Welcome to the Guild!</h1>
          <p className="text-lg text-text-secondary">Let’s set up your profile</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                  s <= step ? 'bg-gradient-primary' : 'bg-bg-tertiary'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-text-secondary">
            Step {step} of 4
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <Card glass className="p-6 sm:p-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-6 text-center">
              What’s your role?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r.value
                      ? 'border-accent-cyan bg-accent-cyan/10'
                      : 'border-white/10 hover:border-accent-cyan/50'
                  }`}
                >
                  <r.icon className="w-8 h-8 sm:w-10 sm:h-10 text-accent-cyan mb-3" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{r.label}</h3>
                  <p className="text-sm text-text-secondary">{r.description}</p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full mt-8 group"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <Card glass className="p-6 sm:p-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">What are your skills?</h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              Select at least 3 skills
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              {SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.find((s) => s.name === skill) ? 'verified' : 'skill'}
                  className="cursor-pointer text-xs sm:text-sm px-3 py-1"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {selectedSkills.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm sm:text-base">Set your skill levels:</h3>
                {selectedSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 glass rounded-lg"
                  >
                    <span className="font-medium text-sm sm:text-base">{skill.name}</span>
                    <div className="flex gap-1 sm:gap-2 flex-wrap">
                      {SKILL_LEVELS.map((level) => (
                        <button
                          key={level}
                          onClick={() => updateSkillLevel(skill.name, level)}
                          className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm transition-all ${
                            skill.level === level
                              ? 'bg-accent-cyan text-white'
                              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-primary'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedSkills.length < 3}
                className="flex-1 group"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Goals & Links */}
        {step === 3 && (
          <Card glass className="p-6 sm:p-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">What are your goals?</h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              Select all that apply
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
              {GOALS.map((goal) => (
                <Badge
                  key={goal}
                  variant={selectedGoals.includes(goal) ? 'verified' : 'skill'}
                  className="cursor-pointer text-xs sm:text-sm px-3 py-1"
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>

            <h3 className="text-lg sm:text-xl font-semibold mb-4">Connect your profiles (optional)</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </label>
                <input
                  type="url"
                  value={externalLinks.github}
                  onChange={(e) =>
                    setExternalLinks({ ...externalLinks, github: e.target.value })
                  }
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-sm sm:text-base"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  LeetCode
                </label>
                <input
                  type="url"
                  value={externalLinks.leetcode}
                  onChange={(e) =>
                    setExternalLinks({ ...externalLinks, leetcode: e.target.value })
                  }
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-sm sm:text-base"
                  placeholder="https://leetcode.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Portfolio
                </label>
                <input
                  type="url"
                  value={externalLinks.portfolio}
                  onChange={(e) =>
                    setExternalLinks({ ...externalLinks, portfolio: e.target.value })
                  }
                  className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all text-sm sm:text-base"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={selectedGoals.length === 0}
                className="flex-1 group"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <Card glass className="p-6 sm:p-8 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">
              Tell us about yourself
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              Write a short bio (optional)
            </p>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full glass border border-white/10 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all min-h-[120px] sm:min-h-[150px] text-sm sm:text-base"
              placeholder="I'm a full-stack developer passionate about building impactful products..."
              maxLength={500}
            />
            <div className="text-right text-xs sm:text-sm text-text-tertiary mt-2">
              {bio.length}/500 characters
            </div>

            <div className="mt-6 sm:mt-8 p-4 sm:p-6 glass rounded-lg">
              <h3 className="font-semibold text-sm sm:text-base mb-3">Profile Summary:</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Role:</span>
                  <Badge variant="status" className="text-xs sm:text-sm px-2 py-1">
                    {role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Skills:</span>
                  <span>{selectedSkills.length} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Goals:</span>
                  <span>{selectedGoals.length} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Links:</span>
                  <span>
                    {Object.values(externalLinks).filter((v) => v).length} connected
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <Button
                variant="secondary"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 group"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
