/* jshint esversion: 6 */

angular.module("meanmail").controller("mailCtrl", ($scope, $http) => {

    var emails;

    $scope.getMail = (label) => {
        return $http({
            method: 'GET',
            url: 'http://localhost:3000/getmail/' + label
        }).then((response) => {

            // $('.tbody').remove();
            // $('.table inbox').append("<tbody class='tbody'></tbody>");

            console.log(response);

            var parsedMail = {
                emails: []
            };

            var mimetypeObj = [];

            var extractField = (json, fieldName) => {
                return json.payload.headers.filter((header) => {
                    return header.name === fieldName;
                })[0].value;
            };

            for (var i = 0; i < response.data.mails.length; i++) {

                parsedMail.emails.push({});

                parsedMail.emails[i].from = extractField(response.data.mails[i], "From");
                parsedMail.emails[i].subject = extractField(response.data.mails[i], "Subject");
                parsedMail.emails[i].date = extractField(response.data.mails[i], "Date");
                parsedMail.emails[i].snippet = response.data.mails[i].snippet;
                parsedMail.emails[i].id = response.data.mails[i].id;
                parsedMail.emails[i].index = i;


                if (response.data.mails[i].payload.hasOwnProperty("parts")) {

                    // PARTS WITHIN PARTS

                    if (response.data.mails[i].payload.parts[0].hasOwnProperty("parts")) {

                        if (_.find(response.data.mails[i].payload.parts, ['mimeType', 'multipart/related'])) {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[1].parts, ['mimeType', 'text/html']);
                        } else {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[0].parts, ['mimeType', 'text/html']);
                        }
                        console.log(i, mimetypeObj[i]);

                        parsedMail.emails[i].html = atob(mimetypeObj[i].body.data.replace(/-/g, '+').replace(/_/g, '/'));

                    }

                    // PARTS
                    else {

                        if (_.find(response.data.mails[i].payload.parts, ['mimeType', 'multipart/related'])) {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[1].parts, ['mimeType', 'text/html']);
                        } else {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts, ['mimeType', 'text/html']);
                        }
                        console.log(i, mimetypeObj[i]);

                        // parsedMail.emails[i].html = atob(parsedMail.emails[i].part[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        parsedMail.emails[i].html = atob(mimetypeObj[i].body.data.replace(/-/g, '+').replace(/_/g, '/'));

                    }
                }

                // NO PARTS JUST BODY
                else {

                    parsedMail.emails[i].html = atob(response.data.mails[i].payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));


                }

                processMessage(parsedMail.emails[i]);
                emails = parsedMail.emails;
                emails[i].index = i;
            }

            function processMessage(message) {

                var row = $('#row-template').html();
                var sender = message.from;
                var subject = message.subject;
                var dateRaw = new Date(message.date);
                var date = moment(dateRaw).calendar();
                var snippet = message.snippet;
                var index = message.index;
                // Remove the email address, leave only sender's name
                var from = message.from.replace(/<\S+@\S+\.\S{2,8}>/g, '').replace(/"+/g, '');

                from = from.trim() || sender;

                var renderedRow = Mustache.render(row, {
                    from: from,
                    subject: subject,
                    snippet: snippet,
                    index: index,
                    date: date
                });

                // REFRESH TABLE??
                $('.main-table tbody').append(renderedRow);
                $('.loading').hide();
                $('.main-table').removeClass('hidden');
            }

            $scope.mails = parsedMail.emails;


            return response;
        });
    };
    $scope.getMail('INBOX');

    $('.main-table tbody').on('click', 'tr.message-link', function(e) {
        var index, title, iframe, messageBody;

        index = $(this).attr('id');

        console.log("index: ", index);

        title = emails[index].subject;
        $('#myModalTitle').text(title);

        iframe = $('#message-iframe')[0].contentWindow.document;
        // The message body goes to the iframe's content
        messageBody = emails[index].html;
        $('body', iframe).html(messageBody);

        console.log("opening mail id ", e, index);
        // Show the modal window
        $('#message-modal').modal('show');

    });

});
