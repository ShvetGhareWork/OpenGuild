# Deploying OpenGuild to Production

This guide covers deploying the OpenGuild application with the frontend on Vercel and the backend on Render.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Render account (free tier works)
- MongoDB Atlas account (for production database)
- Google Cloud Console project (for OAuth)

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `.env` is in `.gitignore` (it should be)
3. Create a `render.yaml` file in the backend directory (optional, for easier deployment)

### Step 2: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0 works)
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/openguild`)

### Step 3: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `openguild-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI=mongodb+srv://your-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-change-this
   SESSION_SECRET=your-session-secret-change-this
   PORT=5000
   FRONTEND_URL=https://your-app.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   REDIS_URL=redis://your-redis-url (optional, or use Render Redis)
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://openguild-backend.onrender.com`)

### Step 4: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://openguild-backend.onrender.com/api/auth/google/callback
   ```
5. Save changes

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Make sure your frontend code is in the root directory
2. Update API URLs to use environment variables (already done)

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to your project root:
   ```bash
   cd c:\OpenGuild
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - **Set up and deploy**: Yes
   - **Which scope**: Your account
   - **Link to existing project**: No
   - **Project name**: openguild
   - **Directory**: `./` (root)
   - **Override settings**: No

6. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://openguild-backend.onrender.com/api
   NEXT_PUBLIC_WS_URL=wss://openguild-backend.onrender.com
   ```

6. Click **"Deploy"**
7. Wait for deployment (3-5 minutes)
8. Copy your frontend URL (e.g., `https://openguild.vercel.app`)

### Step 3: Update Backend Environment Variables

1. Go back to Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://openguild.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

### Step 4: Update Google OAuth Origins

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://openguild.vercel.app
   ```
5. Save changes

---

## Part 3: Verification & Testing

### Test Backend

1. Visit `https://openguild-backend.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### Test Frontend

1. Visit `https://openguild.vercel.app`
2. Landing page should load
3. Click "Continue with Google"
4. Complete OAuth flow
5. Verify redirect to onboarding or dashboard

### Test Full Flow

1. **New User Signup**:
   - Click "Continue with Google"
   - Complete OAuth
   - Verify redirect to onboarding
   - Complete onboarding
   - Verify redirect to dashboard

2. **Existing User Login**:
   - Log out
   - Click "Continue with Google"
   - Verify direct redirect to dashboard

---

## Part 4: Optional Enhancements

### Add Custom Domain (Vercel)

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update `FRONTEND_URL` in Render

### Add Redis (Render)

1. In Render dashboard, click **"New +"** → **"Redis"**
2. Create Redis instance
3. Copy the Redis URL
4. Add to backend environment variables as `REDIS_URL`

### Enable HTTPS (Automatic)

- Vercel: Automatic SSL
- Render: Automatic SSL
- Both platforms handle this automatically

### Set up Monitoring

1. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Free tier available

2. **Render Logs**:
   - View in Render dashboard
   - Set up log drains for external monitoring

---

## Environment Variables Summary

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
PORT=5000
FRONTEND_URL=https://openguild.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIS_URL=redis://... (optional)
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://openguild-backend.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://openguild-backend.onrender.com
```

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Problem**: OAuth redirect fails
- **Solution**: Verify Google OAuth redirect URIs match exactly
- Check `FRONTEND_URL` is set correctly

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings in backend

**Problem**: WebSocket connection fails
- **Solution**: Ensure `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Check backend WebSocket configuration

### OAuth Issues

**Problem**: "redirect_uri_mismatch" error
- **Solution**: Ensure redirect URI in Google Console exactly matches:
  - `https://openguild-backend.onrender.com/api/auth/google/callback`

**Problem**: "invalid_client" error
- **Solution**: Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check for extra spaces or quotes

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Vercel**: Automatically deploys on every push to `main` branch
2. **Render**: Automatically deploys on every push to `main` branch

To disable auto-deploy:
- **Vercel**: Project Settings → Git → Disable auto-deploy
- **Render**: Service Settings → Auto-Deploy → Disable

---

## Cost Estimates

### Free Tier Limits

**Vercel**:
- 100GB bandwidth/month
- Unlimited deployments
- Automatic SSL
- Edge network

**Render**:
- 750 hours/month (enough for 1 service)
- Automatic SSL
- Sleeps after 15 min inactivity (free tier)
- Wakes up on request (may take 30-60 seconds)

**MongoDB Atlas**:
- 512MB storage
- Shared RAM
- No credit card required

### Paid Upgrades (Optional)

**Render Pro** ($7/month):
- No sleep
- Better performance
- More hours

**Vercel Pro** ($20/month):
- More bandwidth
- Team features
- Analytics

---

## Security Checklist

- ✅ All secrets in environment variables (not in code)
- ✅ HTTPS enabled (automatic)
- ✅ CORS configured correctly
- ✅ MongoDB IP whitelist set
- ✅ Strong JWT and session secrets
- ✅ Google OAuth credentials secured
- ✅ `.env` files in `.gitignore`

---

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Enable analytics
4. Set up error tracking (e.g., Sentry)
5. Configure CDN for static assets
6. Set up database backups
7. Create staging environment

---

## Support

If you encounter issues:
1. Check Render logs: `https://dashboard.render.com/`
2. Check Vercel logs: `https://vercel.com/dashboard`
3. Review Google OAuth setup: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
4. Check deployment guide: This file

---

**Deployment Complete!** 🚀

Your app is now live at:
- Frontend: `https://openguild.vercel.app`
- Backend: `https://openguild-backend.onrender.com`
