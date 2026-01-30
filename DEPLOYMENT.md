# OpenGuild - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Redis Cloud account (or local Redis)
- Vercel account (for frontend)
- Railway/Render account (for backend)

---

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

### Backend (.env)

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/openguild
REDIS_URL=redis://default:password@redis-server:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Server
PORT=5000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://your-app.vercel.app

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## MongoDB Atlas Setup

1. **Create Cluster**
   - Go to mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Choose region closest to your users

2. **Configure Access**
   - Database Access → Add user
   - Network Access → Add IP (0.0.0.0/0 for all)

3. **Get Connection String**
   - Connect → Drivers → Copy connection string
   - Replace `<password>` with your password
   - Add `/openguild` at the end for database name

4. **Create Indexes** (Optional - auto-created by models)
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true })
   db.users.createIndex({ username: 1 }, { unique: true })
   db.users.createIndex({ reputationScore: -1 })
   db.projects.createIndex({ slug: 1 }, { unique: true })
   db.projects.createIndex({ status: 1 })
   ```

---

## Redis Cloud Setup

1. **Create Database**
   - Go to redis.com/try-free
   - Create free 30MB database
   - Choose region closest to backend

2. **Get Connection URL**
   - Configuration → Copy endpoint
   - Format: `redis://default:password@host:port`

---

## Backend Deployment (Railway)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="your-mongodb-uri"
   railway variables set REDIS_URL="your-redis-url"
   railway variables set JWT_SECRET="your-jwt-secret"
   railway variables set FRONTEND_URL="https://your-app.vercel.app"
   railway variables set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get URL**
   - Railway will provide a URL like: `https://openguild-backend.railway.app`

---

## Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd ..  # Back to root
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## Alternative: Docker Deployment

### Create Dockerfile (Backend)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend
```

### Deploy
```bash
docker-compose up -d
```

---

## Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable MongoDB encryption at rest
- [ ] Set up firewall rules

### Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Add Posthog for analytics
- [ ] Configure uptime monitoring (UptimeRobot)
- [ ] Set up log aggregation (Logtail)

### Performance
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Optimize images
- [ ] Enable gzip compression
- [ ] Set up database backups

### Testing
- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Test authentication flow
- [ ] Test file uploads (if any)
- [ ] Load testing with k6

---

## Monitoring Setup

### Sentry (Error Tracking)

1. **Install**
   ```bash
   npm install @sentry/nextjs @sentry/node
   ```

2. **Configure Frontend** (sentry.client.config.js)
   ```javascript
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
   });
   ```

3. **Configure Backend**
   ```javascript
   const Sentry = require("@sentry/node");

   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
   });
   ```

---

## Backup Strategy

### MongoDB Backups

1. **Automated Backups** (MongoDB Atlas)
   - Atlas provides automatic backups
   - Configure retention period
   - Test restore process

2. **Manual Backup**
   ```bash
   mongodump --uri="your-mongodb-uri" --out=./backup
   ```

3. **Restore**
   ```bash
   mongorestore --uri="your-mongodb-uri" ./backup
   ```

### Redis Backups

1. **Enable Persistence** (redis.conf)
   ```
   save 900 1
   save 300 10
   save 60 10000
   ```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Railway/Render auto-scales)
- Stateless backend (JWT tokens)
- Redis for session storage
- WebSocket sticky sessions

### Database Scaling
- MongoDB sharding for large datasets
- Read replicas for read-heavy workloads
- Redis cluster for high availability

### CDN
- Cloudflare for static assets
- Image optimization with Cloudinary
- Video hosting with Mux

---

## Cost Estimation

### Free Tier (Development)
- MongoDB Atlas: Free (M0 cluster, 512MB)
- Redis Cloud: Free (30MB)
- Vercel: Free (hobby plan)
- Railway: $5/month credit

**Total: $0-5/month**

### Production (1000 users)
- MongoDB Atlas: $57/month (M10 cluster)
- Redis Cloud: $7/month (250MB)
- Vercel: $20/month (Pro plan)
- Railway: $20/month (backend)
- Sentry: Free (10k events/month)

**Total: ~$100/month**

---

## Troubleshooting

### Common Issues

**CORS Errors**
```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

**WebSocket Connection Failed**
- Check firewall rules
- Verify WSS protocol in production
- Enable sticky sessions

**MongoDB Connection Timeout**
- Whitelist IP addresses
- Check connection string
- Verify network access

**Redis Connection Failed**
- Check Redis URL format
- Verify password
- Test connection with redis-cli

---

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Use dynamic imports for code splitting
- Implement lazy loading
- Enable SWR for data fetching

### Backend
- Enable compression middleware
- Use Redis caching aggressively
- Optimize database queries
- Add database indexes

### Database
- Create compound indexes
- Use projection to limit fields
- Implement pagination
- Use aggregation pipelines

---

*Deployment guide complete! Follow these steps for production deployment.*
