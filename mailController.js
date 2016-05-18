/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';

var google = require('googleapis');
var btoa = require('btoa');
import keys from './keys';
var OAuth2 = google.auth.OAuth2;
var API_KEY = keys.GOOGLE_API_KEY;
var oauth2Client = new OAuth2(keys.GOOGLE_CLIENT_ID, keys.GOOGLE_CLIENT_SECRET, '/auth/google/callback');
google.options({ auth: oauth2Client }); // set auth as a global default

var request = require('request');

module.exports = {

    getMail: (accessToken, label) => {

    console.log(label);

    const emailParsed = {
      mails: []
    };

    let emails;

    let gmail = new Gmail(accessToken);
    emails = gmail.messages(('label:'+String(label)), {max: 100});

    function getHeader(headers, index) {
        var header = '';

        $.each(headers, function() {
            if (this.name === index) {
                header = this.value;
            }
        });
        return header;
    }


    // PROMISES (and they still feel oh so wasted on myself)

    return new Promise(function(resolve, reject) {

      // console.log(emails);

      var count = 0; // REPLACE COUNT WITH ACTUAL DONE STATEMENT REGARDLESS OF MAILBOX SIZE

      emails.on('data',(d) => {
        emailParsed.mails.push(d);
      });

      emails.on('end', () => {
        resolve(emailParsed);
      });
      // .then(res => {
      //   console.log("resolving.");
      //   resolve(emailParsed);
      // });

      // Sort messages by date in descending order
      emailParsed.mails.sort(function(a, b) {
          var d1 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
          var d2 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
          return d1 < d2 ? 1 : (d1 > d2 ? -1 : 0);
      });

    });

  },

  trashMail: (messageId, accToken) => {
    console.log('messageId', messageId);
    console.log('accessT', accToken);

    // request.post(
    //     'https://www.googleapis.com/gmail/v1/users/me/messages/154c112d2e0d678d/trash', {
    //       'headers': {
    //         'Authorization': 'Bearer ' + accToken
    //       }
    //     },
    //     function (error, response, body) {
    //         if (!error && response.statusCode == 200) {
    //             console.log("TRASHED! YAY", body);
    //         }
    //         else {
    //           console.log("error: ", error);
    //           console.log("body: ", body);
    //           console.log("response: ", response);
    //         }
    //     }
    // );

    oauth2Client.setCredentials({
      access_token: accToken
    });

    var gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    gmail.users.messages.trash({
      userId: 'me',
      id: messageId
    });

    // var request2 = gmail.users.messages.list({
    //   key: API_KEY,
    //   userId: 'me',
    //   maxResults: 25
    // });
    //
    // console.log(request2);

    // function displayInbox() {
    //     gmail.users.messages.list({
    //         userId: 'me',
    //         labelIds: 'INBOX',
    //         maxResults: 25
    //     });
    //   }
    //
    // displayInbox();



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

  }

};
