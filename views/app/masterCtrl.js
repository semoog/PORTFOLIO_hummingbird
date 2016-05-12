/* jshint esversion: 6 */

angular.module("meanmail").controller("masterCtrl", ($scope, $http) => {

    $scope.login = () => {
        // return $http({
        //     method: 'GET',
        //     url: 'http://localhost:3000/auth/google'
        // }).then((response) => {

          // window.location.replace("http://localhost:3000/auth/google");
          $(location).attr('href', 'http://localhost:3000/auth/google');

          // if (response && !response.error) {
          //
          //     $authorizeBtn.off();
          //     $authorizeBtn.remove();
          //     $('.table-inbox').removeClass('hidden');
          //     $('#compose-button').removeClass("hidden");
          //
          // }
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
