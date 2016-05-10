angular.module("meanmail").controller("masterCtrl", function($scope, $http) {
  $scope.getMail = function(data) {
    return $http({
      method: 'GET',
      url: 'https://www.googleapis.com/gmail/v1/users/me/messages',
      data: {mail: data}
    }).then(function(response) {
        console.log(response);
        return response;
    });
  };

  setTimeout(function () {
    $scope.getMail();
  }, 10000);
});
