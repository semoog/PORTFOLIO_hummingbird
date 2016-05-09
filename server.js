/* jshint esversion: 6 */

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import keys from './keys'; // hidden keys in gitignore

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = 3000;

// Configure view engine to render EJS templates.

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('express-session')({ secret: keys.sessionSecret, resave: true, saveUninitialized: true }));

// passport facebook init

app.use(passport.initialize());

app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: keys.GOOGLE_CLIENT_ID,
    clientSecret: keys.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));

// Define routes.

app.get('/',
  (req, res) => {
    res.render('home', { user: req.user });
  });

app.get('/login',
  (req, res) =>{
    res.render('login');
  });

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// app.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   (req, res) => {
//     res.render('profile', { user: req.user });
//   });

// serialize / deserialize for passport
// (only used with session, automatically set as next step from passport.use)

passport.serializeUser((user, done) => {
  	done(null, user); // put the whole user object from facebook on the session
});

passport.deserializeUser((obj, done) => {
  	done(null, obj); // get data from session and put it on req.user in every endpoint
});

// listen

app.listen(port, () => {
  	console.log(`Listening on port ${port}`);
});
