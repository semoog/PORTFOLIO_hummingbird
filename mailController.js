/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';
import google from 'googleapis';
import btoa from 'btoa';
import request from 'request';
import refresh from 'passport-oauth2-refresh';
import keys from './keys';
import bluebird from 'bluebird';
import mongoose from 'mongoose';

var OAuth2 = google.auth.OAuth2;
var API_KEY = keys.GOOGLE_API_KEY;
var oauth2Client = new OAuth2(keys.GOOGLE_CLIENT_ID, keys.GOOGLE_CLIENT_SECRET, '/auth/google/callback');
google.options({
    auth: oauth2Client
}); // set auth as a global default

function getMail(accessToken, label) {
    return new Promise(function(resolve, reject) {
        const emailParsed = {
            mails: []
        };

        let gmail, emails;

        gmail = new Gmail(accessToken);
        emails = gmail.messages(('label:' + String(label)), {
            max: 60
        });
        // { fields: ['id', 'internalDate', 'labelIds', 'payload']}

        emails.on('error', (err) => {
            reject(err);
        });

        emails.on('data', (d) => {
            emailParsed.mails.push(d);
        });

        emails.on('end', () => {
            resolve(emailParsed);
        });
    });
}

function trashMail(messageId, accToken) {
    console.log('messageId', messageId);
    console.log('accessT', accToken);

    oauth2Client.setCredentials({
        access_token: accToken
    });

    var gmail = google.gmail({
        version: 'v1',
        auth: oauth2Client
    });

    gmail.users.messages.trash({
        userId: 'me',
        id: messageId
    });
}

function refreshTokenOnError(user, gmailCall, User) {
    return gmailCall(user.accessToken).catch(err => {
        if (/Invalid Credentials/.test(err.message) || err.statusCode === 400) {
            console.log('invalid credentials');
            return new Promise((resolve, reject) => {
                console.log('refreshing access token');
                refresh.requestNewAccessToken('google', user.refreshToken, function(err, accessToken) {
                    if (!user.refreshToken) {
                        reject("No refresh token given.");
                    }
                    if (err) {
                        console.log(err);
                        reject(err);
                    }
                    console.log('got new access token ', accessToken, ' trying again...');

                    User.findByIdAndUpdate(user._id, {
                        accessToken: accessToken
                    }, (err, resp) => {
                        console.log("User updated with accessToken ", accessToken);
                    });

                    resolve(gmailCall(accessToken));
                });
            });
        }
    });
}

module.exports = {

    getMail: (user, label, User) => {
        return refreshTokenOnError(user, (accessToken) => getMail(accessToken, label), User);
    },

    trashMail: (user, messageId, accToken) => {
        trashMail(messageId, accToken);
    },

    removeLabel: (messageId, label, accToken) => {
        console.log("removing label ", label, " from ", messageId);

        oauth2Client.setCredentials({
            access_token: accToken
        });

        var gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

        gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            resource: {
                addLabelIds: [],
                removeLabelIds: [label]
            }
        });
    },

    addLabel: (messageId, label, accToken) => {
        console.log("adding label ", label, " to ", messageId);

        oauth2Client.setCredentials({
            access_token: accToken
        });

        var gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

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

        var gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

        console.log(headers_obj, message);

        var email = '';

        for (var header in headers_obj) {
            console.log(header);
            email += header += ": " + headers_obj[header] + "\r\n";
        }

        email += "\r\n" + message;

        console.log("Before: ", email);

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

        var gmail = google.gmail({
            version: 'v1',
            auth: oauth2Client
        });

        gmail.users.watch({
            'userId': 'me',
            'resource': {
                topicName: "projects/intricate-karma-130320/topics/pull-topic"
            }
        }, function(err, response) {
            console.log("WATCH RESPONSE SERVER: ", response);
            // pubsub.acknowledge();
            return response;
        });
    }

};
