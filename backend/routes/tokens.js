const express = require('express');
const router = express.Router();
const TokenTransaction = require('../models/TokenTransaction');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get token balance and history
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const transactions = await TokenTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate stats
    const totalEarned = await TokenTransaction.aggregate([
      { $match: { userId: user._id, type: 'earn' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSpent = await TokenTransaction.aggregate([
      { $match: { userId: user._id, type: 'spend' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      data: {
        balance: user.tokenBalance,
        lifetimeEarned: totalEarned[0]?.total || 0,
        lifetimeSpent: totalSpent[0]?.total || 0,
        transactions,
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

// Earn tokens
router.post('/earn', authMiddleware, async (req, res) => {
  try {
    const { amount, reason, relatedId } = req.body;

    const user = await User.findById(req.userId);
    const balanceBefore = user.tokenBalance;

    user.tokenBalance += amount;
    await user.save();

    const transaction = new TokenTransaction({
      userId: req.userId,
      type: 'earn',
      amount,
      reason,
      relatedId,
      balanceBefore,
      balanceAfter: user.tokenBalance,
    });

    await transaction.save();

    res.json({
      success: true,
      data: {
        transaction,
        newBalance: user.tokenBalance,
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

// Spend tokens
router.post('/spend', authMiddleware, async (req, res) => {
  try {
    const { amount, reason, relatedId } = req.body;

    const user = await User.findById(req.userId);

    if (user.tokenBalance < amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_TOKENS',
          message: 'Not enough tokens',
        },
      });
    }

    const balanceBefore = user.tokenBalance;

    user.tokenBalance -= amount;
    await user.save();

    const transaction = new TokenTransaction({
      userId: req.userId,
      type: 'spend',
      amount,
      reason,
      relatedId,
      balanceBefore,
      balanceAfter: user.tokenBalance,
    });

    await transaction.save();

    res.json({
      success: true,
      data: {
        transaction,
        newBalance: user.tokenBalance,
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

module.exports = router;
