# gmailer

A module that exposes sending mail using gmail

[![NPM info](https://nodei.co/npm/gmailer.png?downloads=true)](https://npmjs.org/package/gmailer)

This module has been tested under limited scenarios.  If you find any issues, please feel free to report them.

## Install

    npm install gmailer


## API

```javascript
   var send = require('gmailer');

   send(
     oauthRefreshToken, 
     {
       // from is optional.  it is only useful if you want to use a
       // name than the one associated with the account etc.
       from: '"Some User" <someuser@example.com>",
       // to is an array of email addresses
       to: [ 'someone@exapmple.com'],
       // you can pass any extra headers via headers
       headers: {
         Subject: 'Standard header',
         'Message-ID': "Some Unique ID yo"
       },
       // content-type is option and defaults to text/plain
       contentType: 'text/html;chartset=utf8',
       // actual message body comes via body.
       body: "<html><div>Some piece of text</div></html>"
     },
     function (err, ret) {
       //ret.messageId and ret.threadId may be useful.
     }
   );
```

### Other considerations

There is no support for multi-part MIME or attachments.  You are welcome to send patches for those!
