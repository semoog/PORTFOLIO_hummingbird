/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';
import google from 'googleapis';
import btoa from 'btoa';
import request from 'request';
import refresh from 'passport-oauth2-refresh';
import keys from './keys';

var OAuth2 = google.auth.OAuth2;
var API_KEY = keys.GOOGLE_API_KEY;
var oauth2Client = new OAuth2(keys.GOOGLE_CLIENT_ID, keys.GOOGLE_CLIENT_SECRET, '/auth/google/callback');
google.options({ auth: oauth2Client }); // set auth as a global default

function getMail(accessToken, label) {
  return new Promise(function(resolve, reject) {
  const emailParsed = {
    mails: []
  };

  let gmail, emails;

  gmail = new Gmail(accessToken);
  emails = gmail.messages(('label:'+String(label)), {max: 100});
    // { fields: ['id', 'internalDate', 'labelIds', 'payload']}

  // function getHeader(headers, index) {
  //     var header = '';
  //     $.each(headers, function() {
  //         if (this.name === index) {
  //             header = this.value;
  //         }
  //     });
  //     return header;
  // }

  // PROMISES (and they still feel oh so wasted on myself?)


    emails.on('error', (err) => {
      reject(err);
    });

    emails.on('data',(d) => {
      emailParsed.mails.push(d);
    });

    emails.on('end', () => {
      resolve(emailParsed);
    });
    //
    // // Sort messages by date in descending order
    // emailParsed.mails.sort(function(a, b) {
    //     var d1 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
    //     var d2 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
    //     return d1 < d2 ? 1 : (d1 > d2 ? -1 : 0);
    // });
  });
}

function refreshTokenOnError(user, gmailCall) {
  return gmailCall(user.accessToken).catch(err => {
    if(/Invalid Credentials/.test(err.message)) {
      console.log('invalid credentials');
      return new Promise((resolve, reject) => {
        console.log('refreshing access token');
          refresh.requestNewAccessToken('google', user.refreshToken, function(err, accessToken) {
          if(err) {
            reject(err);
          }
          console.log('got new access token ', accessToken, ' trying again...');
          // to-do: save new access token here.
          resolve(gmailCall(accessToken));
        });
      });
    }
  });
}

module.exports = {

  getMail: (user, label) => {
    return refreshTokenOnError(user, (accessToken) => getMail(accessToken, label));
  },

  trashMail: (messageId, accToken) => {
    console.log('messageId', messageId);
    console.log('accessT', accToken);

    oauth2Client.setCredentials({
      access_token: accToken
    });

    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    gmail.users.messages.trash({
      userId: 'me',
      id: messageId
    });
  },

  removeLabel: (messageId, label, accToken) => {
    console.log("removing label ", label, " from ", messageId);

    oauth2Client.setCredentials({
      access_token: accToken
    });

    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds: [label],
        removeLabelIds: []
      }
    });
  },


  sendMail: (headers_obj, message, accToken) => {

    oauth2Client.setCredentials({
      access_token: accToken
    });

    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    console.log(headers_obj, message);

    var email = '';

    for(var header in headers_obj) {
      console.log(header);
      email += header += ": "+headers_obj[header]+"\r\n";
    }

    console.log("Before: ", email);

    email += "\r\n" + message;

    var convertedMail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

    console.log("After btoa: ", convertedMail);

    gmail.users.messages.send({
      'userId': 'me',
      'resource': {
        'raw': convertedMail
      }
    });

  },

  watchMail: (accToken) => {

    oauth2Client.setCredentials({
      access_token: accToken
    });

    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // var pubsub = google.pubsub('v1');
    //
    // pubsub.pull({subscription: 'projects/intricate-karma-130320/subscriptions/pull-subscription'}, function(resp){
    //   console.log("arguments: ", arguments);
    // });

    gmail.users.watch({
      'userId': 'me',
      'resource': {
        topicName: "projects/intricate-karma-130320/topics/pull-topic"
      }
    }, function (err, response) {
        console.log("WATCH RESPONSE SERVER: ", response);
        // pubsub.acknowledge();
        return response;
    });
  }

};
