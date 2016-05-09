angular.module("meanmail").controller("masterCtrl", function($scope) {

  var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

  var keys = require('./keys.js');

  /**
   * Load Gmail API client library. List labels once client library
   * is loaded.
   */
  function loadGmailApi() {
    gapi.client.load('gmail', 'v1');
  }

  function checkAuth() {
    gapi.auth.authorize(
      {
        'client_id': keys.GOOGLE_CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, handleAuthResult);
  }

  function handleAuthClick(event) {
    gapi.auth.authorize(
      {client_id: keys.GOOGLE_CLIENT_ID, scope: SCOPES, immediate: false},
      handleAuthResult);
    return false;
  }

  function handleAuthResult(authResult) {
    console.log(authResult);
    if (authResult && !authResult.error) {
      loadGmailApi();
    }
  }


});
