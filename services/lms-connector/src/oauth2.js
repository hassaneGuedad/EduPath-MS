/**
 * Module OAuth2 pour l'intégration avec Moodle/Canvas
 */
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const { saveSyncLog } = require('./database');

// Configuration OAuth2 (à configurer selon le LMS)
const OAUTH2_CONFIG = {
  clientID: process.env.OAUTH2_CLIENT_ID || '',
  clientSecret: process.env.OAUTH2_CLIENT_SECRET || '',
  callbackURL: process.env.OAUTH2_REDIRECT_URI || 'http://localhost:3001/auth/callback',
  authorizationURL: process.env.OAUTH2_AUTH_URL || 'https://moodle.example.com/oauth2/authorize',
  tokenURL: process.env.OAUTH2_TOKEN_URL || 'https://moodle.example.com/oauth2/token',
  scope: ['read', 'write']
};

// Stratégie OAuth2 pour Moodle/Canvas
const oauth2Strategy = new OAuth2Strategy(
  {
    clientID: OAUTH2_CONFIG.clientID,
    clientSecret: OAUTH2_CONFIG.clientSecret,
    callbackURL: OAUTH2_CONFIG.callbackURL,
    authorizationURL: OAUTH2_CONFIG.authorizationURL,
    tokenURL: OAUTH2_CONFIG.tokenURL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Sauvegarder le token (dans un vrai scénario, on le stockerait en DB)
      console.log('✅ OAuth2 authentication successful');
      return done(null, { accessToken, refreshToken, profile });
    } catch (error) {
      return done(error, null);
    }
  }
);

passport.use('oauth2', oauth2Strategy);

// Sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware d'authentification OAuth2
const authenticateOAuth2 = passport.authenticate('oauth2', {
  session: false,
  failureRedirect: '/auth/error'
});

// Fonction pour récupérer les données depuis un LMS via OAuth2
async function fetchLMSData(accessToken, lmsType = 'moodle') {
  try {
    const axios = require('axios');
    
    // URL de l'API selon le type de LMS
    const apiUrls = {
      moodle: process.env.MOODLE_API_URL || 'https://moodle.example.com/webservice/rest/server.php',
      canvas: process.env.CANVAS_API_URL || 'https://canvas.example.com/api/v1'
    };
    
    const apiUrl = apiUrls[lmsType] || apiUrls.moodle;
    
    // Exemple de requête pour Moodle
    const response = await axios.get(apiUrl, {
      params: {
        wstoken: accessToken,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    await saveSyncLog(lmsType, 'success', response.data?.length || 0, null);
    return response.data;
    
  } catch (error) {
    console.error('Error fetching LMS data:', error);
    await saveSyncLog(lmsType, 'error', 0, error.message);
    throw error;
  }
}

module.exports = {
  passport,
  authenticateOAuth2,
  fetchLMSData,
  OAUTH2_CONFIG
};

