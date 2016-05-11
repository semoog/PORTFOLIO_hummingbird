/* jshint esversion: 6 */

angular.module("meanmail").controller("masterCtrl", ($scope, $http) => {

    $scope.getMail = () => {
        return $http({
            method: 'GET',
            url: 'http://localhost:3000/getmail'
        }).then((response) => {

            console.log(response);

            var parsedMail = {
                emails: []
            };

            var extractField = (json, fieldName) => {
                return json.payload.headers.filter((header) => {
                    return header.name === fieldName;
                })[0].value;
            };

            for (var i = 0; i < response.data.mails.length; i++) {

                parsedMail.emails.push({});

                // parsedMail.emails[i].to = extractField(response.data.mails[i], "To");
                parsedMail.emails[i].from = extractField(response.data.mails[i], "From");
                parsedMail.emails[i].subject = extractField(response.data.mails[i], "Subject");
                parsedMail.emails[i].date = extractField(response.data.mails[i], "Date");


                if (response.data.mails[i].payload.hasOwnProperty("parts")) {

                    // PARTS WITHIN PARTS

                    if (response.data.mails[i].payload.parts[0].hasOwnProperty("parts")) {

                        parsedMail.emails[i].part = response.data.mails[i].payload.parts[0].parts.filter((part) => {
                            return part.mimeType == 'text/html';
                        });

                        parsedMail.emails[i].html = atob(parsedMail.emails[i].part[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));

                    }

                    // PARTS
                    else {

                        parsedMail.emails[i].part = response.data.mails[i].payload.parts.filter((part) => {
                            return part.mimeType == 'text/html';
                        });


                        parsedMail.emails[i].html = atob(parsedMail.emails[i].part[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
                        // parsedMail.emails[i].html = atob(parsedMail.emails[i].part[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));



                    }
                }

                // NO PARTS JUST BODY
                else {

                    parsedMail.emails[i].html = atob(response.data.mails[i].payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));


                }

                processMessage(parsedMail.emails[i]);

            }

            function processMessage(message) {

                var row = $('#row-template').html();
                var sender = message.to;
                var subject = message.subject;
                var date = message.date.toLocaleString();
                // Remove the email address, leave only sender's name
                // var from = sender.replace(/<\S+@\S+\.\S{2,8}>/g, '').replace(/"+/g, '');
                //
                // from = from.trim() || sender;

                var renderedRow = Mustache.render(row, {
                    // from: from,
                    subject: subject,
                    messageId: message.id,
                    date: date
                });

                $('.table-inbox tbody').append(renderedRow);
            }

            // var extractField = function(json, fieldName) {
            //   return json.data.payload.headers.filter(function(header) {
            //     return header.name === fieldName;
            //   })[0].value;
            // };
            //
            // var date = extractField(response, "Date");
            // var subject = extractField(response, "Subject");
            //
            //   var part = response.data.payload.parts.filter(function(part) {
            //     return part.mimeType == 'text/html';
            //   });
            //
            //   var html = atob(part[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));





            $(".first").append(parsedMail.emails[4].html);
            $(".second").append(parsedMail.emails[5].html);

            $scope.mails = parsedMail.emails;


            return response;
        });
    };

        $scope.getMail();

});
