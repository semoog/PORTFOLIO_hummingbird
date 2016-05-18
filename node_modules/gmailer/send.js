var getFreshToken = require('./getFreshToken');
var request = require('request');
var getInfo = require('./getInfo');

module.exports = sendGMail;

var info = {};
function sendGMail(refreshToken, message, done) {
  getFreshToken(refreshToken, function (err, accessToken) {
    if (err) return done(err);
    getUserInfo(refreshToken, accessToken, function (err, userInfo) {
      if (err) return done(err);
      
      var name = message.fromName || userInfo.name;
      var email = message.fromEmail || userInfo.email;
      var smtpMessage = [
        "From: " + (message.from || (JSON.stringify(name) + ' <' + email + '>')),
        "To: " + message.to.join(','),
        "Content-type: " + (message.contentType || 'text/plain;charset=utf8'),
        "MIME-Version: 1.0"
      ].join("\r\n") + "\r\n";
      if (message.headers) for (var key in message.headers) if (message.headers.hasOwnProperty(key)) {
        smtpMessage += key + ': ' + message.headers[key] + "\r\n";
      }
      smtpMessage += "\r\n" + (message.body || "");

      request.post({
        url: "https://www.googleapis.com/upload/gmail/v1/users/me/messages/send",
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'message/rfc822'
        },
        body: smtpMessage
      }, function (err, res, body) {
        if (err) return done(err);
        try {
          var ret = JSON.parse(body);
          if (ret.error) return done(err);
          return done(null, ret);
        } catch (e) {
          return done(e);
        }
      });
    });
  });
}

function getUserInfo(refreshToken, accessToken, done) {
  if (info[refreshToken]) return done(null, info[refreshToken]);
  getInfo(accessToken, function (err, _info) {
    if (err) return done(err);
    info[refreshToken] = _info;
    return done(null, _info);
  });
}
