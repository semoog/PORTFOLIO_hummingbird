/* jshint esversion: 6 */

angular.module("meanmail").controller("masterCtrl", function ($scope, $http) {

    var working = false;

    $('.login').on('submit', function(e) {
      e.preventDefault();
      window.open("http://localhost:3000/auth/google", "mywindow", "width=600px, height=600px");
      if (working) return;
      working = true;
      var $this = $(this),
        $state = $this.find('button > .state');
      $this.addClass('loading');
      $state.html('Authenticating');
      setTimeout(function() {
        $this.addClass('ok');
        setTimeout(function () {
          $('.login').fadeOut("slow", function() {
          $('.cover').removeClass('notouch');
          $('.app-container').removeClass('blur');
        });
        }, 1000);
        $state.html('Welcome back!');
        setTimeout(function() {
          $state.html('Log in');
          $this.removeClass('ok loading');
          working = false;
        }, 4000);
      }, 3000);
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
