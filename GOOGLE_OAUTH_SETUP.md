# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth credentials for the OpenGuild application.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "OpenGuild")
5. Click **"Create"**
6. Wait for the project to be created and select it

### 2. Enable Google+ API

1. In the left sidebar, navigate to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click on it and press **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: OpenGuild
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add the following scopes:
   - `userinfo.email`
   - `userinfo.profile`
8. Click **"Save and Continue"**
9. Add test users if needed (for development)
10. Click **"Save and Continue"** and then **"Back to Dashboard"**

### 4. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "OpenGuild Web Client")
5. Under **"Authorized JavaScript origins"**, add:
   - `http://localhost:3000` (for development)
   - Your production frontend URL (when deploying)
6. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - Your production backend URL + `/api/auth/google/callback` (when deploying)
7. Click **"Create"**

### 5. Copy Your Credentials

1. A dialog will appear showing your **Client ID** and **Client Secret**
2. Copy both values
3. You can also download the JSON file for backup

### 6. Update Your .env File

1. Open `backend/.env` in your code editor
2. Update the following variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   SESSION_SECRET=your-random-session-secret-here
   ```
3. Replace `your-client-id-here` with your actual Client ID
4. Replace `your-client-secret-here` with your actual Client Secret
5. Generate a random string for `SESSION_SECRET` (e.g., use a password generator)
6. Save the file

### 7. Restart Your Backend Server

```bash
cd backend
npm run dev
```

## Testing OAuth Flow

1. Navigate to `http://localhost:3000`
2. Click **"Continue with Google"** button
3. You should be redirected to Google's consent screen
4. Select your Google account
5. Grant permissions
6. You should be redirected back to the app

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Make sure your redirect URI in Google Cloud Console exactly matches the one in your backend
- Check for trailing slashes or http vs https mismatches

### "Error 401: invalid_client"

- Verify your Client ID and Client Secret are correct in `.env`
- Make sure there are no extra spaces or quotes

### "Access blocked: This app's request is invalid"

- Make sure you've configured the OAuth consent screen
- Add your email as a test user if the app is not published

### User not being created

- Check backend console logs for errors
- Verify MongoDB connection is working
- Check that the User model has the `googleId` and `authProvider` fields

## Production Deployment

When deploying to production:

1. Update **Authorized JavaScript origins** with your production frontend URL
2. Update **Authorized redirect URIs** with your production backend URL
3. Update `FRONTEND_URL` and `BACKEND_URL` in your production `.env`
4. Consider publishing your OAuth consent screen for public access

## Security Best Practices

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Rotate your Client Secret periodically
- Monitor OAuth usage in Google Cloud Console
- Implement rate limiting on OAuth endpoints
