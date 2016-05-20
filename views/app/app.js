/* jshint esversion: 6 */

angular.module('meanmail', ['ui.bootstrap', 'ui.router'])
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
         controller: 'mailCtrl',
         resolve: {
           checkAuth: function (masterService, $state) {
             return masterService.checkAuth().then(function (response) {
               return response;
             }).catch(function () {
               $state.go('login');
             });
           },
           user: function (masterService, $state) {
             return masterService.getUser().then(function (response) {
               return response;
             });
           }
         }
      });

      $urlRouterProvider.otherwise('/mail');
   //end config
});
