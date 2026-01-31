const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google OAuth if credentials are provided
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && 
    GOOGLE_CLIENT_ID !== 'your-google-client-id' && 
    GOOGLE_CLIENT_SECRET !== 'your-google-client-secret') {
  
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const displayName = profile.displayName;
          const avatar = profile.photos?.[0]?.value;

          // Check if user exists by Google ID
          let user = await User.findOne({ googleId });

          if (user) {
            // User exists, update last active
            user.lastActiveAt = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists by email (account linking)
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.authProvider = 'google';
            user.avatar = user.avatar || avatar;
            user.lastActiveAt = new Date();
            await user.save();
            return done(null, user);
          }

          // Create new user
          // Generate username from email or display name
          let username = email.split('@')[0];
          
          // Ensure username is unique
          let usernameExists = await User.findOne({ username });
          let counter = 1;
          while (usernameExists) {
            username = `${email.split('@')[0]}${counter}`;
            usernameExists = await User.findOne({ username });
            counter++;
          }

          user = new User({
            email,
            googleId,
            username,
            displayName,
            avatar,
            authProvider: 'google',
            onboardingCompleted: false,
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
  
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️  Google OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

module.exports = passport;
