const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis;

try {
  redis = new Redis(REDIS_URL, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });
} catch (err) {
  console.error('❌ Redis initialization error:', err);
  redis = null;
}

// Cache helper functions
const cache = {
  // Get cached data
  async get(key) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
  },

  // Set cached data with TTL (in seconds)
  async set(key, value, ttl = 3600) {
    if (!redis) return false;
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Cache set error:', err);
      return false;
    }
  },

  // Delete cached data
  async del(key) {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      console.error('Cache delete error:', err);
      return false;
    }
  },

  // Update leaderboard (sorted set)
  async updateLeaderboard(userId, score) {
    if (!redis) return false;
    try {
      await redis.zadd('leaderboard:reputation', score, userId);
      return true;
    } catch (err) {
      console.error('Leaderboard update error:', err);
      return false;
    }
  },

  // Get leaderboard
  async getLeaderboard(limit = 50, offset = 0) {
    if (!redis) return null;
    try {
      const userIds = await redis.zrevrange(
        'leaderboard:reputation',
        offset,
        offset + limit - 1,
        'WITHSCORES'
      );
      
      const results = [];
      for (let i = 0; i < userIds.length; i += 2) {
        results.push({
          userId: userIds[i],
          score: parseInt(userIds[i + 1]),
          rank: offset + (i / 2) + 1,
        });
      }
      
      return results;
    } catch (err) {
      console.error('Leaderboard get error:', err);
      return null;
    }
  },

  // Track online users
  async setOnline(userId) {
    if (!redis) return false;
    try {
      await redis.sadd('online:users', userId);
      await redis.expire('online:users', 300); // 5 minutes
      return true;
    } catch (err) {
      console.error('Set online error:', err);
      return false;
    }
  },

  // Get online users count
  async getOnlineCount() {
    if (!redis) return 0;
    try {
      return await redis.scard('online:users');
    } catch (err) {
      console.error('Get online count error:', err);
      return 0;
    }
  },

  // Cache trending projects
  async updateTrending(projectId, score) {
    if (!redis) return false;
    try {
      // Score = upvotes * recency factor
      await redis.zadd('trending:projects', score, projectId);
      await redis.expire('trending:projects', 3600); // 1 hour
      return true;
    } catch (err) {
      console.error('Update trending error:', err);
      return false;
    }
  },

  // Get trending projects
  async getTrending(limit = 10) {
    if (!redis) return null;
    try {
      return await redis.zrevrange('trending:projects', 0, limit - 1);
    } catch (err) {
      console.error('Get trending error:', err);
      return null;
    }
  },
};

module.exports = { redis, cache };
