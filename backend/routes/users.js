const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');
const { syncGitHubSkills } = require('../utils/github');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Verify skills from external links
router.post('/me/verify-skills', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const verifiedSkills = [];

    // GitHub verification
    if (user.externalLinks?.github) {
      try {
        const username = user.externalLinks.github.split('/').pop();
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        
        if (response.ok) {
          const repos = await response.json();
          
          // Analyze languages used
          const languages = new Set();
          repos.forEach(repo => {
            if (repo.language) languages.add(repo.language);
          });

          // Map languages to skills
          const languageSkillMap = {
            'JavaScript': 'JavaScript',
            'TypeScript': 'TypeScript',
            'Python': 'Python',
            'Java': 'Java',
            'Go': 'Go',
            'Rust': 'Rust',
            'C++': 'C++',
            'C': 'C',
            'Ruby': 'Ruby',
            'PHP': 'PHP',
          };

          languages.forEach(lang => {
            if (languageSkillMap[lang]) {
              verifiedSkills.push({
                name: languageSkillMap[lang],
                verified: true,
                source: 'github',
              });
            }
          });

          // Check for framework usage in repo names/descriptions
          const frameworks = ['React', 'Vue', 'Angular', 'Next.js', 'Express', 'Django', 'Flask'];
          repos.forEach(repo => {
            const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
            frameworks.forEach(framework => {
              if (text.includes(framework.toLowerCase())) {
                verifiedSkills.push({
                  name: framework,
                  verified: true,
                  source: 'github',
                });
              }
            });
          });
        }
      } catch (err) {
        console.error('GitHub verification error:', err);
      }
    }

    // Update user skills with verification
    if (verifiedSkills.length > 0) {
      user.skills = user.skills.map(skill => {
        const verified = verifiedSkills.find(v => v.name === skill.name);
        if (verified && !skill.verified) {
          return {
            ...skill,
            verified: true,
            verifiedAt: new Date(),
          };
        }
        return skill;
      });

      await user.save();
    }

    res.json({
      success: true,
      data: {
        verifiedSkills: verifiedSkills.map(v => ({ name: v.name, source: v.source })),
        totalVerified: verifiedSkills.length,
      },
    });
  } catch (error) {
    console.error('Skill verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Update current user
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { bio, skills, externalLinks, goals, role, onboardingCompleted, displayName, username } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Check if username is being changed and if it's already taken
    if (username !== undefined && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'Username is already taken',
          },
        });
      }
      user.username = username;
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (externalLinks !== undefined) user.externalLinks = externalLinks;
    if (goals !== undefined) user.goals = goals;
    if (role !== undefined) user.role = role;
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Upload avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path (relative to backend root)
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
        url: `${BACKEND_URL}${user.avatar}`,
      },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get public profile with projects
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-passwordHash -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Get user's public projects
    const Project = require('../models/Project');
    const projects = await Project.find({
      creatorId: userId,
      visibility: 'public',
    })
      .select('name description status techStack team createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    // Get projects where user is a team member
    const teamProjects = await Project.find({
      'team.userId': userId,
      visibility: 'public',
    })
      .select('name description status techStack team createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        createdProjects: projects,
        teamProjects,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    // Try to get from cache first
    const { cache } = require('../utils/cache');
    const cacheKey = `leaderboard:${limit}:${offset}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Fetch from database
    const users = await User.find()
      .select('username displayName avatar reputationScore')
      .sort({ reputationScore: -1 })
      .skip(offset)
      .limit(limit);

    const total = await User.countDocuments();

    const usersWithRank = users.map((user, index) => ({
      ...user.toObject(),
      rank: offset + index + 1,
    }));

    const result = {
      users: usersWithRank,
      total,
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
});

// ─── Add these routes to backend/routes/users.js ─────────────────────────────
// Place them BEFORE module.exports = router;
// They handle resume upload, certificate upload, work experience CRUD
// ── Upload Resume (PDF only) ──────────────────────────────────────────────────
router.post('/me/resume', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Only PDF files are allowed for resume' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old resume if exists
    if (user.resume?.fileUrl) {
      const oldPath = path.join(__dirname, '..', user.resume.fileUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.resume = {
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
    };

    await user.save();

    res.json({
      success: true,
      data: {
        resume: user.resume,
        url: `${BACKEND_URL}${user.resume.fileUrl}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ── Delete Resume ─────────────────────────────────────────────────────────────
router.delete('/me/resume', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.resume?.fileUrl) {
      const filePath = path.join(__dirname, '..', user.resume.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.resume = undefined;
    await user.save();

    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ── Upload Certificate file ───────────────────────────────────────────────────
router.post('/me/certificates/upload', authMiddleware, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Only PDF, JPG, PNG files allowed' });
    }

    res.json({
      success: true,
      data: {
        fileUrl: `/uploads/certificates/${req.file.filename}`,
        fileName: req.file.originalname,
        url: `${BACKEND_URL}/uploads/certificates/${req.file.filename}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ── Add / Update Work Experience ──────────────────────────────────────────────
router.patch('/me/experience', authMiddleware, async (req, res) => {
  try {
    const { workExperience } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.workExperience = workExperience;
    await user.save();

    res.json({ success: true, data: { workExperience: user.workExperience, validationScore: user.validationScore } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// ── Add / Update Certifications ───────────────────────────────────────────────
router.patch('/me/certifications', authMiddleware, async (req, res) => {
  try {
    const { certifications } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.certifications = certifications;
    await user.save();

    res.json({ success: true, data: { certifications: user.certifications, validationScore: user.validationScore } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});
// ── Sync skills with GitHub ──────────────────────────────────────────────────
router.post('/me/sync/github', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const githubUsername = req.body.githubUsername || user.githubUsername || user.externalLinks?.github?.split('/').pop();
    if (!githubUsername) {
      return res.status(400).json({ success: false, message: 'GitHub username required' });
    }

    const githubSkills = await syncGitHubSkills(githubUsername);
    
    // Update user skills
    githubSkills.forEach(newSkill => {
      const existingSkill = user.skills.find(s => s.name.toLowerCase() === newSkill.name.toLowerCase());
      if (existingSkill) {
        existingSkill.verified = true;
        existingSkill.verifiedAt = new Date();
      } else {
        user.skills.push(newSkill);
      }
    });

    user.githubUsername = githubUsername;
    await user.save();

    res.json({
      success: true,
      data: {
        skills: user.skills,
        validationScore: user.validationScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
