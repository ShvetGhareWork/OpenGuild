const User = require('../models/User');
const Project = require('../models/Project');

// Calculate skill compatibility score (0-100)
const calculateSkillCompatibility = (userSkills, projectTechStack) => {
  if (!userSkills || !projectTechStack || projectTechStack.length === 0) {
    return 0;
  }

  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const matchingSkills = projectTechStack.filter(tech =>
    userSkillNames.includes(tech.toLowerCase())
  );

  const baseScore = (matchingSkills.length / projectTechStack.length) * 100;

  // Bonus for verified skills
  const verifiedMatches = matchingSkills.filter(tech => {
    const skill = userSkills.find(s => s.name.toLowerCase() === tech.toLowerCase());
    return skill && skill.verified;
  });

  const verificationBonus = (verifiedMatches.length / matchingSkills.length) * 10;

  return Math.min(Math.round(baseScore + verificationBonus), 100);
};

// Calculate goal alignment score (0-100)
const calculateGoalAlignment = (userGoals, projectStatus) => {
  if (!userGoals || userGoals.length === 0) return 50; // Neutral

  const goalScores = {
    'Learn new skills': projectStatus === 'recruiting' ? 80 : 60,
    'Build portfolio': 90,
    'Get hired': 85,
    'Start a startup': projectStatus === 'recruiting' ? 95 : 70,
    'Freelance work': 75,
    'Network with builders': 80,
    'Mentor others': 40,
    'Find co-founder': projectStatus === 'recruiting' ? 100 : 50,
  };

  const scores = userGoals.map(goal => goalScores[goal] || 50);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

// Calculate reputation compatibility (0-100)
const calculateReputationScore = (userReputation, projectCreatorReputation) => {
  const diff = Math.abs(userReputation - projectCreatorReputation);

  // Prefer similar reputation levels (within 200 points)
  if (diff <= 100) return 100;
  if (diff <= 200) return 80;
  if (diff <= 300) return 60;
  if (diff <= 500) return 40;
  return 20;
};

// Calculate overall match score
const calculateMatchScore = (user, project) => {
  const weights = {
    skillCompatibility: 0.35,
    goalAlignment: 0.25,
    reputationScore: 0.15,
    activityBonus: 0.15,
    diversityBonus: 0.10,
  };

  const skillScore = calculateSkillCompatibility(user.skills, project.techStack);
  const goalScore = calculateGoalAlignment(user.goals, project.status);
  const reputationScore = calculateReputationScore(
    user.reputationScore,
    project.creatorId?.reputationScore || 0
  );

  // Activity bonus (recent activity)
  const daysSinceActive = (Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24);
  const activityScore = daysSinceActive <= 1 ? 100 : daysSinceActive <= 7 ? 80 : 50;

  // Diversity bonus (different trust levels working together)
  const diversityScore = user.trustLevel !== project.creatorId?.trustLevel ? 70 : 50;

  const totalScore =
    skillScore * weights.skillCompatibility +
    goalScore * weights.goalAlignment +
    reputationScore * weights.reputationScore +
    activityScore * weights.activityBonus +
    diversityScore * weights.diversityBonus;

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      skillCompatibility: Math.round(skillScore),
      goalAlignment: Math.round(goalScore),
      reputationCompatibility: Math.round(reputationScore),
      activityScore: Math.round(activityScore),
      diversityScore: Math.round(diversityScore),
    },
  };
};

// Find matching projects for a user
const findMatchingProjects = async (userId, limit = 10) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Get recruiting projects
    const projects = await Project.find({ status: 'recruiting' })
      .populate('creatorId', 'username displayName reputationScore trustLevel')
      .limit(50);

    // Calculate match scores
    const matches = projects.map(project => {
      const match = calculateMatchScore(user, project);
      return {
        project,
        matchScore: match.totalScore,
        breakdown: match.breakdown,
      };
    });

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Find matching projects error:', error);
    throw error;
  }
};

// Find matching team members for a project
const findMatchingMembers = async (projectId, limit = 10) => {
  try {
    const project = await Project.findById(projectId).populate('creatorId');

    if (!project) {
      throw new Error('Project not found');
    }

    // Get active users not already on the team
    const teamMemberIds = project.team.map(m => m.userId.toString());
    const users = await User.find({
      _id: { $nin: [...teamMemberIds, project.creatorId._id] },
      onboardingCompleted: true,
    }).limit(100);

    // Calculate match scores
    const matches = users.map(user => {
      const match = calculateMatchScore(user, project);
      return {
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          reputationScore: user.reputationScore,
          trustLevel: user.trustLevel,
          skills: user.skills,
        },
        matchScore: match.totalScore,
        breakdown: match.breakdown,
      };
    });

    // Sort by match score and return top matches
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Find matching members error:', error);
    throw error;
  }
};

module.exports = {
  calculateSkillCompatibility,
  calculateGoalAlignment,
  calculateReputationScore,
  calculateMatchScore,
  findMatchingProjects,
  findMatchingMembers,
};
