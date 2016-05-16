/* jshint esversion: 6 */

// import bootstrap from 'bootstrap';

angular.module("meanmail").controller("mailCtrl", function ($scope, $http) {

      // $(document).ready(function() {
      //   $('.main-table').dynatable();
      // });


    //   $(document).on('click', '.nav li', function() {
    //      $(".nav li").removeClass("active");
    //      $(this).addClass("active");
    //  });

    $scope.emails = {};

    $scope.mails = {};

    $scope.getMail = (label) => {
        return $http({
            method: 'GET',
            url: 'http://localhost:3000/getmail/' + label
        }).then((response) => {

            // $('.tbody').remove();
            // $('.table inbox').append("<tbody class='tbody'></tbody>");

            // console.log(response);

            const parsedMail = {
                emails: []
            };

            const mimetypeObj = [];

            const extractField = (json, fieldName) => {
                return json.payload.headers.filter((header) => {
                    return header.name === fieldName;
                })[0].value;
            };

            for (let i = 0; i < response.data.mails.length; i++) {

                // filtering for properties

                parsedMail.emails.push({});

                parsedMail.emails[i].from = extractField(response.data.mails[i], "From");
                parsedMail.emails[i].sender = parsedMail.emails[i].from.replace(/<\S+@\S+\.\S{2,8}>/g, '').replace(/"+/g, '');
                parsedMail.emails[i].subject = extractField(response.data.mails[i], "Subject");
                parsedMail.emails[i].date = extractField(response.data.mails[i], "Date");
                parsedMail.emails[i].date = moment(parsedMail.emails[i].date).calendar();
                parsedMail.emails[i].snippet = response.data.mails[i].snippet;
                parsedMail.emails[i].id = response.data.mails[i].id;
                parsedMail.emails[i].labels = response.data.mails[i].labelIds;
                parsedMail.emails[i].index = i;

                parsedMail.emails[i].unread = false;
                parsedMail.emails[i].important = false;

                if (_.indexOf(parsedMail.emails[i].labels, 'UNREAD') > 0) {
                  parsedMail.emails[i].unread = true;
                  console.log("found UNREAD on id ", i);
                }

                if (_.indexOf(parsedMail.emails[i].labels, 'IMPORTANT') > 0) {
                  parsedMail.emails[i].important = true;
                  console.log("found IMPORTANT on id ", i);
                }

                if (response.data.mails[i].payload.hasOwnProperty("parts")) {



                    // PARTS WITHIN PARTS

                    if (response.data.mails[i].payload.parts[0].hasOwnProperty("parts")) {

                      // PARTS WITHIN PARTS WITHIN PARTS??

                      if (response.data.mails[i].payload.parts[0].parts[0].hasOwnProperty("parts")) {

                          if (_.find(response.data.mails[i].payload.parts[0].parts, ['mimeType', 'multipart/related'])) {
                              mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[1].parts[1].parts, ['mimeType', 'text/html']);
                          } else {
                              mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[0].parts[0].parts, ['mimeType', 'text/html']);
                          }
                          // console.log(i, mimetypeObj[i]);

                          parsedMail.emails[i].html = atob(mimetypeObj[i].body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/&#39;/, ' ');

                      }

                        else if (_.find(response.data.mails[i].payload.parts, ['mimeType', 'multipart/related'])) {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[1].parts, ['mimeType', 'text/html']);
                        } else {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[0].parts, ['mimeType', 'text/html']);
                        }
                        // console.log(i, mimetypeObj[i]);

                        parsedMail.emails[i].html = atob(mimetypeObj[i].body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/&#39;/, ' ');

                    }

                    // PARTS
                    else {

                        if (_.find(response.data.mails[i].payload.parts, ['mimeType', 'multipart/related'])) {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts[1].parts, ['mimeType', 'text/html']);
                        } else {
                            mimetypeObj[i] = _.find(response.data.mails[i].payload.parts, ['mimeType', 'text/html']);
                        }
                        // console.log(i, mimetypeObj[i]);

                        parsedMail.emails[i].html = atob(mimetypeObj[i].body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/&#39;/, ' ');

                    }
                }

                // NO PARTS JUST BODY
                else {

                    parsedMail.emails[i].html = atob(response.data.mails[i].payload.body.data.replace(/-/g, '+').replace(/_/g, '/')).replace(/&#39;/, ' ');

                }

                processMessage(parsedMail.emails[i]);
                $scope.emails = parsedMail.emails;
                $scope.emails[i].index = i;
            }



            function processMessage(message) {

                let row = $('#row-template').html();
                let sender = message.from;
                let subject = message.subject;
                let dateRaw = new Date(message.date);
                let date = moment(dateRaw).calendar();
                let snippet = message.snippet;
                let index = message.index;
                $scope.curIndex = message.index;
                // Remove the email address, leave only sender's name
                let from = message.from.replace(/<\S+@\S+\.\S{2,8}>/g, '').replace(/"+/g, '');

                from = from.trim() || sender;

                const renderedRow = Mustache.render(row, {
                    from: from,
                    subject: subject,
                    snippet: snippet,
                    index: index,
                    date: date
                });

                // REFRESH TABLE??
                $('.main-table tbody').append(renderedRow);
                $('.spinner').hide();
                $('.main-table').removeClass('hidden');
            }

            $scope.mails = parsedMail.emails;
            // $('.mailbox').append("<div class='mail' ng-repeat='mail in emails'>{{mail.subject}}</div>");

            // $('.main-table').dynatable({
            //   table: {
            //     copyHeaderClass: true
            //   }
            // });
            // var count = -1;
            // $('tr').each(function(){
            //   $(this).addClass('message-link');
            //   $(this).attr('id', count);
            //   count++;
            //   // console.log(index);
            // }); // FIX
            console.log($scope.mails);
            // $apply();
            $scope.viewby = 10;
            console.log("Mail length: ", $scope.mails.length);
            $scope.totalItems = $scope.mails.length;
            $scope.currentPage = 1;
            $scope.itemsPerPage = $scope.viewby;
            $scope.maxSize = 5; //Number of pager buttons to show

            $scope.setPage = function (pageNo) {
              $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function() {
              console.log('Page changed to: ' + $scope.currentPage);
            };

            $scope.setItemsPerPage = function(num) {
              $scope.itemsPerPage = num;
              $scope.currentPage = 1; //reset to first page
            };
            return response;
        });
    };

    // setTimeout(function () {
      $scope.getMail('INBOX');
    // }, 5000);

    $('.container').on('click', 'div.message-link', function(e) {
        let index, title, sender, date, iframe, messageBody;

        index = $(this).attr('id');

        title = $scope.emails[index].subject;
        sender = $scope.emails[index].from;
        date = moment($scope.emails[index].date).calendar();

        $scope.mails[index].unread = false;

        $('#modalTitle').text(title);
        $('#modalSender').text(sender);
        $('#modalDate').text(date);

        iframe = $('#message-iframe')[0].contentWindow.document;
        // The message body goes to the iframe's content
        messageBody = $scope.emails[index].html;
        $('body', iframe).html(messageBody);

        // Show the modal window
        $('#message-modal').modal('show');

    });

});
