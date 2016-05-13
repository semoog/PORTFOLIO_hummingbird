angular.module('meanmail', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider) {

   $stateProvider
      .state('login', {
         url: '/login',
         templateUrl: '../login.html',
         controller: 'masterCtrl'
      });

   $stateProvider
      .state('mail', {
         url: '/mail',
         templateUrl: '../mail.html',
         controller: 'mailCtrl'
      });

      $urlRouterProvider.otherwise('/login');
   //end config
});
