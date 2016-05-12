/* jshint esversion: 6 */

import Gmail from 'node-gmail-api';

module.exports = {

    getMail: (accessToken, refreshToken, profile, req) => {

      console.log(req.params.label);

    const emailParsed = {
      mails: []
    };

    let emails;

    let gmail = new Gmail(accessToken);
    emails = gmail.messages(('label:'+String(req.params.label)), {max: 50});

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

      var count = 0; // REPLACE COUNT WITH ACTUAL DONE STATEMENT REGARDLESS OF MAILBOX SIZE

      emails.on('data',(d) => {
      //   debugger;
        emailParsed.mails.push(d);
        count++;
        if (count === 50) {
          resolve(emailParsed);
        }
      });

      // Sort messages by date in descending order
      emailParsed.mails.sort(function(a, b) {
          var d1 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
          var d2 = new Date(getHeader(emailParsed.data.mails.payload.headers, 'Date')).valueOf();
          return d1 < d2 ? 1 : (d1 > d2 ? -1 : 0);
      });

    });

  }
};
