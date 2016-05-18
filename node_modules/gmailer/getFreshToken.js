var request = require('request');
module.exports = getFreshToken;

var params = {
  client_id: process.env.GAPI_KEY, 
  client_secret: process.env.GAPI_SECRET, 
  grant_type: 'refresh_token'
};
var tokenInfo = {expires: 0, pending: []};
function getFreshToken(refreshToken, done) {
  if (tokenInfo.expires > Date.now() + 60000) return done(null, tokenInfo.access_token);
  tokenInfo.pending.push(done);
  if (tokenInfo.pending.length > 1) return;
  var form = JSON.parse(JSON.stringify(params));
  form.refresh_token = refreshToken;
  request.post({url: 'https://accounts.google.com/o/oauth2/token', form: form}, onResponse);
  function onResponse(err, response, body) {
    if (err) return complete(err);
    try {
      var info = JSON.parse(body);
      if (info.error) return complete(info.error);
      tokenInfo.access_token = info.access_token;
      tokenInfo.expires = Date.now() + 1000 * +info.expires_in;
      return complete(null, tokenInfo.access_token);
    } catch (e) {
      return complete(e);
    }
  }
  function complete(err, result) {
    var cbs = tokenInfo.pending;
    tokenInfo.pending = [];
    cbs.forEach(function (cb) {
      try { cb(err, result); } catch (e) {}
    });
  }
}
