/* jshint esversion: 6 */

angular.module("meanmail").controller("mailCtrl", function($scope, $http, user, $state, hotkeys) {

    // vars

    $scope.user = user;

    $scope.firstName = $scope.user.name.split(' ');

    $scope.firstName = $scope.firstName[0];

    $scope.emails = {};

    $scope.currentMailbox = '';

    $scope.mails = {};
    $scope.mailbox_title = 'inbox';

    var scrolled = false;

    // jquery init

    $(".scroll_container").hide();

    $(document).on('click', '.icon-container--nav', function() {
        $(".icon-container--nav").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on('click', '.compose-container--nav', function() {
        $(this).addClass("selected");
        setTimeout(function() {
            $(this).removeClass("selected");
        }, 500);
    });
    $(document).on('click', '.label-container--nav', function() {
        $(".label-container--nav").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on('click', '.pane-email', function() {
        $(".pane-email").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on('click', '.nav-container', function() {
        $(".nav-container").removeClass("selected");
        $(this).addClass("selected");
    });

    // scroll-tip

    $(".mail-container").scroll(function() {
        console.log("scrolled");
        scrolled = true;
    });

    $(".mail-container").scroll(function() {
        $(".scroll_container").fadeOut('slow');
    });

    // tidy compose modal after send

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
                'To': $('#compose-to').val(),
                'Subject': $('#compose-subject').val()
            },
            $('#compose-message').val()
        );

        return false;
    };

    // getMail parsing

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

    // get

    $scope.getMail = (label) => {
        $scope.currentMailbox = label;
        console.log($scope.currentMailbox);
        $('.load').fadeIn("fast", function() {

        });
        return $http({
            method: 'GET',
            url: '/getMail/' + label
        }).then((response) => {


            const parsedMail = {
                emails: []
            };

            $scope.unreadCounter = 0;

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
                parsedMail.emails[i].subject = extractField(response.data.mails[i], "Subject").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                if (extractField(response.data.mails[i], "Date") !== (undefined || null)) {
                    console.log("mail id: ", i, "date response: ", extractField(response.data.mails[i], "Date"));
                    parsedMail.emails[i].date = extractField(response.data.mails[i], "Date");
                } else {
                    parsedMail.emails[i].date = response.data.mails[i].internalDate;
                }
                parsedMail.emails[i].date = moment(parsedMail.emails[i].date).calendar();
                parsedMail.emails[i].snippet = response.data.mails[i].snippet.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
                parsedMail.emails[i].messageId = response.data.mails[i].id;
                parsedMail.emails[i].labels = response.data.mails[i].labelIds;
                parsedMail.emails[i].index = i;

                parsedMail.emails[i].unread = false;
                parsedMail.emails[i].important = false;

                if (_.indexOf(parsedMail.emails[i].labels, 'UNREAD') > 0) {
                    parsedMail.emails[i].unread = true;
                    $scope.unreadCounter++;
                    console.log("found UNREAD on id ", i);
                }

                if (_.indexOf(parsedMail.emails[i].labels, 'IMPORTANT') > 0) {
                    parsedMail.emails[i].important = true;
                    console.log("found IMPORTANT on id ", i);
                }

                parsedMail.emails[i].html = getBody(response.data.mails[i].payload);

                $scope.emails = parsedMail.emails;
                $scope.emails[i].index = i;
                $scope.mailbox_title = label.toLowerCase();
                $('.load').fadeOut('slow', function() {

                });
            }

            $scope.mails = parsedMail.emails;

            console.log($scope.mails);

            // setTimeout(function () {
            //   if (scrolled === false) {
            //       $( ".scroll_container" ).fadeIn('slow');
            //   }
            // }, 10000);
            return response;
        });
    };

    // send

    $scope.sendMail = (headers_obj, message) => {
        return $http({
            method: 'POST',
            url: '/sendMail/',
            data: {
                headers_obj,
                message
            }
        }).then((response) => {
            composeTidy();
        });
    };

    // watch mail

    $scope.watchMail = () => {
        return $http({
            method: 'GET',
            url: '/watchMail/'
        }).then((response) => {
            console.log("WATCH RESPONSE: ", response);
        });
    };

    $scope.watchMail();

    // trash mail

    $scope.trashMail = (messageId) => {
        return $http({
            method: 'POST',
            url: '/trashMail/',
            data: {
                messageId: messageId
            }
        }).then((response) => {
            console.log("trashed");
        });
    };

    // remove label

    $scope.removeLabel = (messageId, label) => {
        return $http({
            method: 'POST',
            url: '/removeLabel/',
            data: {
                messageId: messageId,
                label: label
            }
        }).then((response) => {
            console.log("removeLabel response: ", response);
            console.log("removed label", label);
        });
    };
    $scope.addLabel = (messageId, label) => {
        return $http({
            method: 'POST',
            url: '/addLabel/',
            data: {
                messageId: messageId,
                label: label
            }
        }).then((response) => {
            console.log("addLabel response: ", response);
            console.log("added label", label);
        });
    };

    // modal popup

    $('.mail-container').on('click', 'div.message-link', function(e) {
        let index, title, sender, date, iframe, messageBody;

        let kids = $(this).children('unread-badge');

        kids.remove();

        index = $(this).attr('id');

        title = $scope.emails[index].subject;
        sender = $scope.emails[index].from;
        date = $scope.emails[index].date;
        messageId = $scope.emails[index].messageId;

        $scope.mails[index].unread = false;
        $scope.removeLabel(messageId, 'UNREAD');

        $('#emailTitle').text(title);
        $('#emailSender').text(sender);
        $('#emailDate').text(date);

        iframe = $('#message-iframe')[0].contentWindow.document;
        // The message body goes to the iframe's content
        messageBody = $scope.emails[index].html;
        $('body', iframe).html(messageBody);

        // Show the modal window
        $('.email').show();
    });

    // scroll-helper

    var s = $("#scroll");
    var r = console.log("DONE");
    var t = new TimelineMax({
        repeat: -1,
        repeatDelay: 0.9,
        onComplete: r,
        ease: Expo.easeIn
    });
    t.to(s, 0.3, {
        y: 10
    }).to(s, 0.2, {
        opacity: 0
    }, 0.2).to(s, 0.5, {
        y: 0
    }).to(s, 0.3, {
        opacity: 1
    });

    // hotkeys

    hotkeys.add({
        combo: 'r',
        description: 'Refresh Inbox',
        callback: function() {
            $scope.getMail('INBOX');
        }
    });

    // init mail getter

    $scope.getMail('INBOX');

    $(".favorited").hide();


    const animationDelay = 600;

    function removeEmail(messageId) {
        setTimeout(function() {
            $scope.mails = $scope.mails.filter(function(email) {
                return email.messageId !== messageId;
            });
            $scope.$apply();
        }, animationDelay);
    }

    $scope.$on('mail-item-remove', function(e, messageId) {
        console.log(messageId);
        removeEmail(messageId);
        $scope.trashMail(messageId);
    });
    $scope.$on('mail-item-archive', function(e, messageId) {
        removeEmail(messageId);
        $scope.addLabel(messageId, 'STARRED');
    });
});
