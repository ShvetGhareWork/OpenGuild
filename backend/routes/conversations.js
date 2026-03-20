const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

// Get all conversations for a user (teams they are part of)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { creatorId: req.userId },
        { 'team.userId': req.userId }
      ]
    });

    const conversations = await Promise.all(projects.map(async (project) => {
      let conv = await Conversation.findOne({ projectId: project._id })
        .populate('lastMessage')
        .populate('participants', 'username avatar');
      
      const teamUserIds = [project.creatorId.toString(), ...project.team.map(m => m.userId.toString())];

      if (!conv) {
        conv = await Conversation.create({
          projectId: project._id,
          name: project.name,
          participants: teamUserIds,
          isGroup: true
        });
        conv = await Conversation.findById(conv._id).populate('participants', 'username avatar');
      } else {
        // Sync participants if changed
        const convUserIds = conv.participants.map(p => p._id.toString());
        const hasChanged = teamUserIds.length !== convUserIds.length || !teamUserIds.every(id => convUserIds.includes(id));
        if (hasChanged) {
          conv.participants = teamUserIds;
          await conv.save();
          conv = await Conversation.findById(conv._id).populate('participants', 'username avatar');
        }
      }
      
      const convObj = conv.toObject();
      return {
        ...convObj,
        projectName: project.name,
        projectStatus: project.status
      };
    }));

    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific conversation by projectId
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember = project.team.some(m => m.userId.toString() === req.userId) || 
                     project.creatorId.toString() === req.userId;

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let conversation = await Conversation.findOne({ projectId })
      .populate('lastMessage')
      .populate('participants', 'username displayName avatar');

    const teamUserIds = [project.creatorId.toString(), ...project.team.map(m => m.userId.toString())];

    if (!conversation) {
      conversation = await Conversation.create({
        projectId: project._id,
        name: project.name,
        participants: teamUserIds,
        isGroup: true
      });
      conversation = await Conversation.findById(conversation._id).populate('participants', 'username displayName avatar');
    } else {
      // Sync participants if changed
      const convUserIds = conversation.participants.map(p => p._id.toString());
      const hasChanged = teamUserIds.length !== convUserIds.length || !teamUserIds.every(id => convUserIds.includes(id));
      
      if (hasChanged) {
        conversation.participants = teamUserIds;
        await conversation.save();
        conversation = await Conversation.findById(conversation._id).populate('participants', 'username displayName avatar');
      }
    }

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
