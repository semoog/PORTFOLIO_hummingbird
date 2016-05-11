/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';

module.exports = {

    getMail: (accessToken, refreshToken, profile) => {

    let emailParsed = {
      mails: []
    };

    let emails = {};

    const gmail = new Gmail(accessToken);
    emails = gmail.messages('label:INBOX', {max: 50});

    function getHeader(headers, index) {
        var header = '';

        $.each(headers, function() {
            if (this.name === index) {
                header = this.value;
            }
        });
        return header;
    }


    emails.on('data',(d) => {
      emailParsed.mails.push(d);
    });

    // Sort messages by date in descending order
    emailParsed.mails.sort(function(a, b) {
        var d1 = new Date(getHeader(emailParsed.mails.payload.headers, 'Date')).valueOf();
        var d2 = new Date(getHeader(emailParsed.mails.payload.headers, 'Date')).valueOf();
        return d1 < d2 ? 1 : (d1 > d2 ? -1 : 0);
    });

    return emailParsed;
  }
};
