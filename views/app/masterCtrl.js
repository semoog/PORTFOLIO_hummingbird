/* jshint esversion: 6 */

angular.module("meanmail").controller("masterCtrl", function ($scope, $http, masterService, $state) {

    var openedWindow;

    var auth;

    $('.login').on('submit', function(e) {
      e.preventDefault();
      openedWindow = window.open("http://localhost:3000/auth/google", "Hummingbird Auth", "width=400px, height=400px, top=400, left=600");
      var $this = $(this),
        $btnstate = $this.find('button > .state');
      $this.addClass('loading');
      $btnstate.html('Authenticating');

      var refreshAuth = setInterval(function () {
        masterService.checkAuth().then(function(data) {
          console.log("data", data);
          if (data.status) {
            auth = data.status;
          }
          else {
            auth = data;
          }
        });
        if (auth === 200) { // IF AUTH WHAT?
          openedWindow.close();
          console.log("good status! yay");
          $this.addClass('ok');
          $btnstate.html('Welcome back!');
          setTimeout(function () {

            $('.background').addClass('bg-white');
            $('.login').fadeOut(400, function() {
              $state.go('mail');
            });

          }, 2000);
          setTimeout(function() {
            $btnstate.html('Log in');
            $this.removeClass('ok loading');
          }, 4000);
          clearInterval(refreshAuth);
        }
      }, 1000);

    });

    $scope.login = () => {

          // $(location).attr('href', 'http://localhost:3000/auth/google');
          // window.top.location.href = '/auth/google';
          return window.open("http://localhost:3000/auth/google", "mywindow");

      };

      // Initialize UI events
      // let init = () => {
      //
      //     $('#authorize-button').on('click', function() {
      //         $scope.login();
      //     });
      //
      //     $('.table-inbox tbody').on('click', 'a.message-link', function(e) {
      //         var id, title, iframe, messageBody;
      //
      //         id = $(this).attr('id').split('-')[2];
      //
      //         title = getHeader(Messages[id].payload.headers, 'Subject');
      //         $('#myModalTitle').text(title);
      //
      //         iframe = $('#message-iframe')[0].contentWindow.document;
      //         // The message body goes to the iframe's content
      //         messageBody = getBody(Messages[id].payload);
      //         $('body', iframe).html(messageBody);
      //
      //         // Show the modal window
      //         $('#message-modal').modal('show');
      //
      //     });
      //
      // };
      //
      // init();

    // $scope.getMail('INBOX');
    // setTimeout(function () {
    //   $scope.getMail('INBOX');
    // }, 8000);

  });
