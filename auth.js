/*
 * decoded-express-auth middleware
 *
 * Authentication middleware for Decoded's Express-based applications
 */

// passportjs and Auth0 custom passportjs auth strategy
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
// Session and cookies middlewares to keep user logged in
var cookieParser = require('cookie-parser');
var session = require('express-session');
// used for generating uuid for cookie secret
var uuid = require('node-uuid');
// for overriding options object
var merge = require('merge');

// global module default config object
var OPTIONS = {
  auth0: {
    callbackURL: '/auth/callback'
  },
  cookieSecret: uuid.v4(),
  successRedirect: '/',
  failureRedirect: '/',
  serializeUser: null,
  deserializeUser: null
};

// passportjs verify callback for the Auth0Strategy
var verifyCallback = function (
  accessToken, refreshToken, extraParams, profile, done
) {
  // accessToken is the token to call Auth0 API (not needed in the most cases)
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user
  return done(null, profile);
}

// passportjs default user serialisation/deserialisation functions
// This is not a best practice, but we want to keep things simple for now
var serializeUser = function (user, done) {
  done(null, user);
}

var deserializeUser = function (user, done) {
  done(null, user);
}

// the route handler for the auth0 callback
var authCallbackHandler = function (req, res) {
  if (!req.user) {
    throw new Error('user null');
  }
  res.redirect(OPTIONS.successRedirect);
}

/*
 * This is called by init() and is used to load Auth0 config variables from
 * environment variables. You can also call it yourself if you want.
 * By default, this doesn't override variables that already exit, but you
 * can optionally tell it to override all variables with the environment ones
 * if you want, with the sole function argument.
 */
exports.reloadConfig = function(override) {
  if (override) {
    OPTIONS.auth0 = merge(
      OPTIONS.auth0,
      {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET
      }
    );
  } else {
    if (!OPTIONS.auth0.domain) {
      OPTIONS.auth0.domain = process.env.AUTH0_DOMAIN;
    }
    if (!OPTIONS.auth0.clientID) {
      OPTIONS.auth0.clientID = process.env.AUTH0_CLIENT_ID;
    }
    if (!OPTIONS.auth0.clientSecret) {
      OPTIONS.auth0.clientSecret = process.env.AUTH0_CLIENT_SECRET;
    }
  }
}

/*
 * Call this once with your express app instance as the first argument and an
 * options object as the second. This will setup and initialise the middleware.
 */
exports.init = function (app, options) {
  // reload options from environment variables
  module.exports.reloadConfig(false);
  // override any options that were specified
  if (options) {
    OPTIONS = merge.recursive(OPTIONS, options);
  }
  // build auth0 passportjs strategy
  var strategy = new Auth0Strategy(OPTIONS.auth0, verifyCallback);
  passport.use(strategy);
  // register passportjs serialisation/deserialisation functions
  passport.serializeUser(OPTIONS.serializeUser || serializeUser);
  passport.deserializeUser(OPTIONS.deserializeUser || deserializeUser);
  // register cookie and session middlewares
  app.use(cookieParser());
  app.use(
    session(
      {
        secret: OPTIONS.cookieSecret,
        resave: false,
        saveUninitialized: false
      }
    )
  );
  // register passportjs middlewares
  app.use(passport.initialize());
  app.use(passport.session());
  // create Auth0 callback handler
  app.get(
    OPTIONS.auth0.callbackURL,
    passport.authenticate(
      'auth0', { failureRedirect: OPTIONS.failureRedirect }
    ),
    authCallbackHandler
  );
}

// Use this middleware to protect one or more routes from access without auth
exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect(OPTIONS.auth0.callbackURL);
  }
  next();
}
