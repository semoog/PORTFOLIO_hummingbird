/* jshint esversion: 6 */

// import bootstrap from 'bootstrap';

angular.module("meanmail").controller("mailCtrl", function ($scope, $http) {

    // INIT

    // $(document).ready(function() {
    //   $('.message-link').slick();
    // });

    $( ".scroll-helper" ).hide();

    $(document).on('click', '.icon-container', function() {
       $(".icon-container").removeClass("active");
       $(this).addClass("active");
    });

    var scrolled = false;

    $(".mail-container").scroll(function() {
      console.log("scrolled");
      scrolled = true;
    });

    $(".mail-container").scroll(function() {
      $( ".scroll-helper" ).fadeOut('slow');
    });

    $scope.emails = {};

    $scope.mails = {};

    function composeTidy() {

      $('#compose-modal').modal('hide');

      $('#compose-to').val('');
      $('#compose-subject').val('');
      $('#compose-message').val('');

      $('#send-button').removeClass('disabled');
    }

    window.sendEmail = function sendEmail() {

      $('#send-button').addClass('disabled');

      $scope.sendMail({
        headers_obj: {
          'To': $('#compose-to').val(),
          'Subject': $('#compose-subject').val()
        },
        message: $('#compose-message').val()
      }
      );

      return false;
    };

    function getBody(message) {
        var encodedBody = '';

        encodedBody = message.parts ? getHTMLPart(message.parts) : message.body.data;
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return decodeURIComponent(escape(window.atob(encodedBody)));
    }

    function getHTMLPart(arr) {
        for (var x = 0; x < arr.length; x++) {
            if (typeof arr[x].parts === 'undefined') {
                if (arr[x].mimeType === 'text/html') {
                    return arr[x].body.data;
                }
            } else {
                return getHTMLPart(arr[x].parts);
            }
        }
        return '';
    }

    // FETCH

    $scope.getMail = (label) => {
        return $http({
            method: 'GET',
            url: 'http://localhost:3000/getMail/' + label
        }).then((response) => {

            // $('.tbody').remove();
            // $('.table inbox').append("<tbody class='tbody'></tbody>");

            console.log(response);

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

                parsedMail.emails[i].html = getBody(response.data.mails[i].payload);

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
                $('.load').hide();
                $('.main-table').removeClass('hidden');
            }

            $scope.mails = parsedMail.emails;

            console.log($scope.mails);
            $scope.viewby = 50;
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
            setTimeout(function () {
              if (scrolled === false) {
                  $( ".scroll-helper" ).fadeIn('slow');
              }
            }, 10000);
            return response;
        });
    };

    $scope.sendMail = (mailObj) => {
      return $http({
          method: 'POST',
          url: 'http://localhost:3000/sendMail/',
          data: mailObj
      }).then((response) => {
        composeTidy();
      });
    };

    $scope.getMail('INBOX');

    $('.mail-container').on('click', 'div.message-link', function(e) {
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
