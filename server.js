/* jshint esversion: 6 */

// dependencies

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import Gmail from 'node-gmail-api';
import keys from './keys';
import async from 'asyncawait/async';
import await from 'asyncawait/await';
import cors from 'cors';
var mail = require('./mailController');

// express init

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/views'));

app.use(require('express-session')({ secret: keys.sessionSecret, resave: true, saveUninitialized: true }));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

// passport init

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// mongoose init

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/meanmail");

var userSchema = new Schema({
  googleId: String
});

const User = mongoose.model("User", userSchema);

// cors init

const corsOptions = {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

// passport init

app.use(passport.initialize());

app.use(passport.session());

// variable init

let accToken;
let refToken;
let userProfile;
let emails = {};
let user = {};

// Google Login Strategy

passport.use(new GoogleStrategy({
    clientID: keys.GOOGLE_CLIENT_ID,
    clientSecret: keys.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {

    // Store token locally for access later

    accToken = accessToken;
    refToken = refreshToken;
    userProfile = profile;

    // Check for or add user to database

    User.findOne({
            'googleId': profile.id
        }, (err, user) => {
            if (err) {
                return cb(err);
            }
            // user not found. create
            if (!user) {
                user = new User({
                    googleId: profile.id
                });
                user.save((err) => {
                    if (err) console.log(err);
                    return cb(err, user);
                });
            } else {
                return cb(err, user);
            }
        });

  }
));

function ensureAuthenticated(req, res, next) {
  console.log("checking auth...");
  if (req.isAuthenticated()) {
    console.log("authentication good");
    return next();
  }
  else {
    console.log("bad auth. redirecting to login?");
    res.redirect('/#/login'); // NOT!
  }
}

// Define routes.

app.get('/',
  (req, res) => {
    res.redirect('/mail');
  });


app.get('/login',
  (req, res) => {
    res.redirect('/#/login');
  });

app.get('/mail',
  ensureAuthenticated,
  (req, res) => {
    console.log("redirecting to mail");
    res.redirect('/#/mail', { user: req.user });
  });

app.get('/getmail/:label',
  ensureAuthenticated,
  async (function (req, res){
    console.log("getting mail");
      let emailParsed = await(mail.getMail(accToken, refToken, userProfile, req));
      res.send(emailParsed);
  }));

// Google Authentication Routes

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', SCOPES] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    console.log("Successfully Authenticated.");
    res.redirect('/#/mail');
  });

// serialize / deserialize for passport

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
