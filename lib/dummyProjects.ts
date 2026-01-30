// Dummy project data to simulate MongoDB-fetched content
export const dummyProjects = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'DeFi Trading Platform',
    slug: 'defi-trading-platform',
    description: 'A decentralized trading platform with advanced charting, real-time data, and automated trading strategies. Built for the next generation of crypto traders.',
    vision: 'Democratize access to sophisticated trading tools for everyone',
    creatorId: {
      _id: '507f1f77bcf86cd799439001',
      username: 'cryptobuilder',
      displayName: 'Alex Chen',
      avatar: null,
      reputationScore: 2850
    },
    techStack: ['React', 'TypeScript', 'Solidity', 'Web3.js', 'Node.js', 'MongoDB'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439001',
          username: 'cryptobuilder',
          displayName: 'Alex Chen',
          reputationScore: 2850
        },
        role: 'founder',
        joinedAt: new Date('2025-12-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439002',
          username: 'smartcontractdev',
          displayName: 'Sarah Kim',
          reputationScore: 1920
        },
        role: 'Smart Contract Developer',
        joinedAt: new Date('2025-12-15')
      }
    ],
    openRoles: [
      {
        role: 'Frontend Developer',
        skills: ['React', 'TypeScript', 'TailwindCSS'],
        description: 'Looking for an experienced frontend developer to build responsive trading interfaces',
        filled: false
      },
      {
        role: 'UI/UX Designer',
        skills: ['Figma', 'Design Systems', 'Web3 UX'],
        description: 'Need a designer who understands crypto user flows',
        filled: false
      }
    ],
    milestones: [
      {
        title: 'Smart Contract Audit',
        description: 'Complete security audit of all trading contracts',
        deadline: new Date('2026-02-15'),
        completed: true,
        completedAt: new Date('2026-01-20')
      },
      {
        title: 'Beta Launch',
        description: 'Launch beta version to 100 selected users',
        deadline: new Date('2026-03-01'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 342,
    upvotedBy: [],
    views: 1547,
    status: 'recruiting',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-25')
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'AI Code Review Assistant',
    slug: 'ai-code-review-assistant',
    description: 'An intelligent code review tool that uses machine learning to detect bugs, suggest improvements, and enforce best practices across your codebase.',
    vision: 'Make code reviews faster, smarter, and more consistent',
    creatorId: {
      _id: '507f1f77bcf86cd799439003',
      username: 'mlexpert',
      displayName: 'Jordan Martinez',
      avatar: null,
      reputationScore: 3200
    },
    techStack: ['Python', 'TensorFlow', 'FastAPI', 'React', 'PostgreSQL', 'Docker'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439003',
          username: 'mlexpert',
          displayName: 'Jordan Martinez',
          reputationScore: 3200
        },
        role: 'founder',
        joinedAt: new Date('2025-11-15')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439004',
          username: 'backendpro',
          displayName: 'Emily Zhang',
          reputationScore: 2100
        },
        role: 'Backend Engineer',
        joinedAt: new Date('2025-12-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439005',
          username: 'datawhiz',
          displayName: 'Marcus Johnson',
          reputationScore: 1850
        },
        role: 'ML Engineer',
        joinedAt: new Date('2025-12-10')
      }
    ],
    openRoles: [
      {
        role: 'DevOps Engineer',
        skills: ['Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
        description: 'Scale our infrastructure to handle millions of code reviews',
        filled: false
      }
    ],
    milestones: [
      {
        title: 'MVP Release',
        description: 'Launch minimum viable product with basic code analysis',
        deadline: new Date('2026-01-15'),
        completed: true,
        completedAt: new Date('2026-01-10')
      },
      {
        title: 'GitHub Integration',
        description: 'Build seamless GitHub App integration',
        deadline: new Date('2026-02-28'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 528,
    upvotedBy: [],
    views: 2341,
    status: 'active',
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2026-01-28')
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'HealthTrack - Personal Wellness App',
    slug: 'healthtrack-personal-wellness-app',
    description: 'A comprehensive health and wellness tracking app with AI-powered insights, meal planning, workout routines, and mental health support.',
    vision: 'Empower people to take control of their health journey',
    creatorId: {
      _id: '507f1f77bcf86cd799439006',
      username: 'healthtech',
      displayName: 'Priya Patel',
      avatar: null,
      reputationScore: 2450
    },
    techStack: ['React Native', 'TypeScript', 'Node.js', 'MongoDB', 'GraphQL', 'AWS'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439006',
          username: 'healthtech',
          displayName: 'Priya Patel',
          reputationScore: 2450
        },
        role: 'founder',
        joinedAt: new Date('2025-10-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439007',
          username: 'mobiledev',
          displayName: 'Carlos Rodriguez',
          reputationScore: 1680
        },
        role: 'Mobile Developer',
        joinedAt: new Date('2025-11-01')
      }
    ],
    openRoles: [
      {
        role: 'Backend Developer',
        skills: ['Node.js', 'GraphQL', 'MongoDB', 'AWS'],
        description: 'Build scalable APIs for health data processing',
        filled: false
      },
      {
        role: 'Product Designer',
        skills: ['Figma', 'Mobile UI/UX', 'User Research'],
        description: 'Design intuitive health tracking experiences',
        filled: false
      },
      {
        role: 'Data Scientist',
        skills: ['Python', 'Machine Learning', 'Health Analytics'],
        description: 'Create AI models for personalized health insights',
        filled: false
      }
    ],
    milestones: [
      {
        title: 'iOS App Launch',
        description: 'Release iOS version on App Store',
        deadline: new Date('2026-03-15'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 215,
    upvotedBy: [],
    views: 892,
    status: 'recruiting',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2026-01-20')
  },
  {
    _id: '507f1f77bcf86cd799439014',
    name: 'EduConnect - Learning Platform',
    slug: 'educonnect-learning-platform',
    description: 'A modern e-learning platform connecting students with expert instructors. Features live classes, interactive assignments, and peer collaboration.',
    vision: 'Make quality education accessible to everyone, everywhere',
    creatorId: {
      _id: '507f1f77bcf86cd799439008',
      username: 'edutech',
      displayName: 'Michael Brown',
      avatar: null,
      reputationScore: 1950
    },
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'WebRTC', 'Redis'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439008',
          username: 'edutech',
          displayName: 'Michael Brown',
          reputationScore: 1950
        },
        role: 'founder',
        joinedAt: new Date('2025-09-01')
      }
    ],
    openRoles: [
      {
        role: 'Full Stack Developer',
        skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'WebRTC'],
        description: 'Build core platform features and live streaming functionality',
        filled: false
      },
      {
        role: 'Frontend Developer',
        skills: ['React', 'TypeScript', 'TailwindCSS'],
        description: 'Create engaging student and instructor dashboards',
        filled: false
      }
    ],
    milestones: [],
    visibility: 'public',
    upvotes: 167,
    upvotedBy: [],
    views: 634,
    status: 'recruiting',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2026-01-15')
  },
  {
    _id: '507f1f77bcf86cd799439015',
    name: 'GreenChain - Carbon Credit Marketplace',
    slug: 'greenchain-carbon-credit-marketplace',
    description: 'Blockchain-based marketplace for trading verified carbon credits. Transparent, secure, and helping companies achieve net-zero goals.',
    vision: 'Accelerate the transition to a carbon-neutral economy',
    creatorId: {
      _id: '507f1f77bcf86cd799439009',
      username: 'climatetech',
      displayName: 'Aisha Rahman',
      avatar: null,
      reputationScore: 3100
    },
    techStack: ['Solidity', 'Hardhat', 'React', 'TypeScript', 'IPFS', 'The Graph'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439009',
          username: 'climatetech',
          displayName: 'Aisha Rahman',
          reputationScore: 3100
        },
        role: 'founder',
        joinedAt: new Date('2025-08-15')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439010',
          username: 'web3builder',
          displayName: 'David Lee',
          reputationScore: 2750
        },
        role: 'Blockchain Developer',
        joinedAt: new Date('2025-09-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439011',
          username: 'sustaindev',
          displayName: 'Lisa Wang',
          reputationScore: 1420
        },
        role: 'Frontend Developer',
        joinedAt: new Date('2025-10-15')
      }
    ],
    openRoles: [],
    milestones: [
      {
        title: 'Smart Contract Deployment',
        description: 'Deploy verified contracts to Ethereum mainnet',
        deadline: new Date('2026-01-30'),
        completed: true,
        completedAt: new Date('2026-01-28')
      },
      {
        title: 'Partnership with 10 Companies',
        description: 'Onboard 10 enterprise clients',
        deadline: new Date('2026-04-01'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 489,
    upvotedBy: [],
    views: 1823,
    status: 'active',
    createdAt: new Date('2025-08-15'),
    updatedAt: new Date('2026-01-29')
  },
  {
    _id: '507f1f77bcf86cd799439016',
    name: 'StreamSync - Content Creator Tools',
    slug: 'streamsync-content-creator-tools',
    description: 'All-in-one platform for content creators to manage streams, engage with audience, and monetize content across multiple platforms.',
    vision: 'Empower creators to build sustainable businesses',
    creatorId: {
      _id: '507f1f77bcf86cd799439012',
      username: 'creatortools',
      displayName: 'Ryan Cooper',
      avatar: null,
      reputationScore: 1780
    },
    techStack: ['Vue.js', 'TypeScript', 'Node.js', 'Redis', 'WebSocket', 'Stripe'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439012',
          username: 'creatortools',
          displayName: 'Ryan Cooper',
          reputationScore: 1780
        },
        role: 'founder',
        joinedAt: new Date('2025-11-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439013',
          username: 'realtimedev',
          displayName: 'Nina Patel',
          reputationScore: 2050
        },
        role: 'Backend Developer',
        joinedAt: new Date('2025-12-01')
      }
    ],
    openRoles: [
      {
        role: 'Frontend Developer',
        skills: ['Vue.js', 'TypeScript', 'WebSocket'],
        description: 'Build real-time creator dashboards',
        filled: false
      }
    ],
    milestones: [
      {
        title: 'Twitch Integration',
        description: 'Complete Twitch API integration',
        deadline: new Date('2026-02-01'),
        completed: true,
        completedAt: new Date('2026-01-25')
      },
      {
        title: 'YouTube Integration',
        description: 'Add YouTube streaming support',
        deadline: new Date('2026-03-15'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 298,
    upvotedBy: [],
    views: 1156,
    status: 'active',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2026-01-26')
  },
  {
    _id: '507f1f77bcf86cd799439017',
    name: 'SecureVault - Password Manager',
    slug: 'securevault-password-manager',
    description: 'Open-source, end-to-end encrypted password manager with biometric authentication, secure sharing, and breach monitoring.',
    vision: 'Make digital security accessible and user-friendly',
    creatorId: {
      _id: '507f1f77bcf86cd799439014',
      username: 'securitypro',
      displayName: 'Kevin Zhang',
      avatar: null,
      reputationScore: 2890
    },
    techStack: ['Rust', 'React', 'Electron', 'SQLite', 'WebAssembly'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439014',
          username: 'securitypro',
          displayName: 'Kevin Zhang',
          reputationScore: 2890
        },
        role: 'founder',
        joinedAt: new Date('2025-07-01')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439015',
          username: 'rustdev',
          displayName: 'Sophie Anderson',
          reputationScore: 2340
        },
        role: 'Rust Developer',
        joinedAt: new Date('2025-08-15')
      },
      {
        userId: {
          _id: '507f1f77bcf86cd799439016',
          username: 'cryptoexpert',
          displayName: 'Ahmed Hassan',
          reputationScore: 2650
        },
        role: 'Security Engineer',
        joinedAt: new Date('2025-09-01')
      }
    ],
    openRoles: [],
    milestones: [
      {
        title: 'Security Audit',
        description: 'Complete third-party security audit',
        deadline: new Date('2026-01-15'),
        completed: true,
        completedAt: new Date('2026-01-12')
      },
      {
        title: 'v1.0 Release',
        description: 'Launch stable version 1.0',
        deadline: new Date('2026-02-28'),
        completed: false
      }
    ],
    visibility: 'public',
    upvotes: 612,
    upvotedBy: [],
    views: 2847,
    status: 'completed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2026-01-30')
  },
  {
    _id: '507f1f77bcf86cd799439018',
    name: 'FoodieMap - Restaurant Discovery',
    slug: 'foodiemap-restaurant-discovery',
    description: 'Discover hidden gem restaurants, share food experiences, and connect with fellow food lovers in your city.',
    vision: 'Help people discover amazing food experiences',
    creatorId: {
      _id: '507f1f77bcf86cd799439017',
      username: 'foodtech',
      displayName: 'Maria Garcia',
      avatar: null,
      reputationScore: 1560
    },
    techStack: ['React Native', 'Node.js', 'MongoDB', 'Google Maps API', 'Firebase'],
    team: [
      {
        userId: {
          _id: '507f1f77bcf86cd799439017',
          username: 'foodtech',
          displayName: 'Maria Garcia',
          reputationScore: 1560
        },
        role: 'founder',
        joinedAt: new Date('2025-12-15')
      }
    ],
    openRoles: [
      {
        role: 'Mobile Developer',
        skills: ['React Native', 'TypeScript', 'Firebase'],
        description: 'Build iOS and Android apps',
        filled: false
      },
      {
        role: 'Backend Developer',
        skills: ['Node.js', 'MongoDB', 'REST APIs'],
        description: 'Develop scalable backend services',
        filled: false
      },
      {
        role: 'UI/UX Designer',
        skills: ['Figma', 'Mobile Design', 'Prototyping'],
        description: 'Design delightful food discovery experiences',
        filled: false
      }
    ],
    milestones: [],
    visibility: 'public',
    upvotes: 143,
    upvotedBy: [],
    views: 521,
    status: 'recruiting',
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2026-01-18')
  }
];

// Helper function to get projects with optional filtering
export function getProjects(filters?: {
  status?: string;
  sort?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let filteredProjects = [...dummyProjects];

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    filteredProjects = filteredProjects.filter(p => p.status === filters.status);
  }

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProjects = filteredProjects.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.techStack.some(tech => tech.toLowerCase().includes(searchLower))
    );
  }

  // Apply sorting
  if (filters?.sort) {
    switch (filters.sort) {
      case 'trending':
        filteredProjects.sort((a, b) => {
          // Sort by upvotes first, then by recent
          if (b.upvotes !== a.upvotes) {
            return b.upvotes - a.upvotes;
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        break;
      case 'upvotes':
        filteredProjects.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'recent':
      default:
        filteredProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }
  }

  // Apply pagination
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 20;
  const paginatedProjects = filteredProjects.slice(offset, offset + limit);

  return {
    projects: paginatedProjects,
    total: filteredProjects.length
  };
}

// Helper function to get a single project by ID
export function getProjectById(id: string) {
  return dummyProjects.find(project => project._id === id);
}
