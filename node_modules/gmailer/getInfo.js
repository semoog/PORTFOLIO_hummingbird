var request = require('request');
var getFreshToken = require('./getFreshToken');

module.exports = getInfo;

function getInfo(accessToken, done) {
  request({
    url: 'https://www.googleapis.com/plus/v1/people/me',
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  }, function (err, response, body) {
    if (err) return done(err);
    try {
      var info = JSON.parse(body);
      var email = '';
      if (info && info.emails && info.emails[0] && info.emails[0].value) {
        email = info.emails[0].value;
      }
      var name = info.displayName || email;
      return done(null, {email: email, name: name});
    } catch (e) {
      return done(e);
    }
  });
}

