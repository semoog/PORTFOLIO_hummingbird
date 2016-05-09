/* jshint esversion: 6 */

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import Gmail from 'node-gmail-api';
import keys from './keys'; // hidden keys in gitignore

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/* Connect to database */
mongoose.connect("mongodb://localhost/meanmail");

var userSchema = new Schema({
  googleId: String
});

const User = mongoose.model("User", userSchema);

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
    const gmail = new Gmail(accessToken);
    let s = gmail.messages('label:INBOX', {max: 10});
    console.log(accessToken);
    // console.log(profile);
    // console.log(s);
    s.on('data', function (d) {
      console.log(d.snippet);
    });

    User.findOne({
            'googleId': profile.id
        }, (err, user) => {
            if (err) {
                return cb(err);
            }
            // user not found. create
            if (!user) {
                user = new User({
                    googleId: profile.id,
                    emails: s
                });
                user.save((err) => {
                    if (err) console.log(err);
                    return cb(err, user);
                });
            } else {
                //found user. Return
                user.emails = s;
                user.save((err) => {
                    if (err) console.log(err);
                    return cb(err, user);
                });
                // console.log(s.snippet);
                // s.on('data', function (d) {
                //   console.log(d.snippet);
                // });
                return cb(err, user);
            }
        });
  }
));

// Define routes.

app.get('/',
  (req, res) => {
    res.render('home', { user: req.user });
  });

app.get('/home',
  (req, res) => {
    res.render('home', { user: req.user });
  });

  // app.get('/fail',
  //   (req, res) => {
  //     res.render('fail');
  //   });

app.get('/login',
  (req, res) =>{
    res.render('login');
  });

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', SCOPES] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  (req, res) => {
    res.render('profile', { user: req.user });
  });

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
