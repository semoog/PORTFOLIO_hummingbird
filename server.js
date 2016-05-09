/* jshint esversion: 6 */

import express from 'express';
import session from 'express-session';
import passport from 'passport';
import keys from 'keys'; // hidden keys in gitignore

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = 3000;

// Copyright 2012-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var readline = require('readline');

var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');

// Client ID and client secret are available at
// https://code.google.com/apis/console
var CLIENT_ID = keys.GOOGLE_CLIENT_ID;
var CLIENT_SECRET = keys.GOOGLE_CLIENT_SECRET;
var REDIRECT_URL = 'http://localhost:3000/auth/google/callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getAccessToken (oauth2Client, callback) {
  // generate consent page url
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: 'https://www.googleapis.com/auth/plus.me' // can be a space-delimited string or an array of scopes
  });

  console.log('Visit the url: ', url);
  rl.question('Enter the code here:', function (code) {
    // request access token
    oauth2Client.getToken(code, function (err, tokens) {
      if (err) {
        return callback(err);
      }
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      oauth2Client.setCredentials(tokens);
      callback();
    });
  });
}

// retrieve an access token
getAccessToken(oauth2Client, function () {
  // retrieve user profile
  plus.people.get({ userId: 'me', auth: oauth2Client }, function (err, profile) {
    if (err) {
      return console.log('An error occured', err);
    }
    console.log(profile.displayName, ':', profile.tagline);
  });
});

// Configure view engine to render EJS templates.

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('express-session')({ secret: keys.sessionSecret, resave: true, saveUninitialized: true }));

// passport facebook init

app.use(passport.initialize());

app.use(passport.session());

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
