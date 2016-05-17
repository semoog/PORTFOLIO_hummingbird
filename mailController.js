/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';
import send from 'gmailer';
var xoauth2 = require('xoauth2');
var nodemailer = require('nodemailer');

import keys from './keys';

module.exports = {

    getMail: (accessToken, refreshToken, profile, req) => {

      console.log(req.params.label);

    const emailParsed = {
      mails: []
    };

    let emails;

    let gmail = new Gmail(accessToken);
    emails = gmail.messages(('label:'+String(req.params.label)), {max: 200});

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
      //   debugger;
        emailParsed.mails.push(d);
        count++;
        if (count === 200) { // fuck.
          console.log("resolving.");
          resolve(emailParsed);
        }
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


  sendMail: (headers_obj, message, accToken, refToken) => {

    // generator.on('token', function(token){
    //   console.log('New token for %s: %s', token.user, token.accessToken);
    // });

    // login
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        debug: true,
        auth: {
            xoauth2: xoauth2.createXOAuth2Generator({
                user: 'sebmernst',
                clientId: keys.GOOGLE_CLIENT_ID,
                clientSecret: keys.GOOGLE_CLIENT_SECRET,
                refreshToken: refToken,
                accessToken: accToken
            })
        }
    });

    transporter.verify(function(error, success) {
       if (error) {
            console.log(error);
       } else {
            console.log('Server is ready to take our messages');
       }
    });

    transporter.sendMail({
        from: 'sebmernst@gmail.com',
        to: 'sebmernst@gmail.com',
        subject: 'hello world!',
        text: 'Authenticated with OAuth2'
    }, function(error, response) {
       if (error) {
            console.log(error);
       } else {
            console.log('Message sent');
       }
    });


    // console.log(headers_obj, message);
    //
    // var email = '';
    //
    // for(var header in headers_obj)
    //   email += header += ": "+headers_obj[header]+"\r\n";
    //
    // email += "\r\n" + message;

    // var sendRequest = gapi.client.gmail.users.messages.send({
    //   'userId': 'me',
    //   'resource': {
    //     'raw': btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
    //   }
    // });

  }

};
