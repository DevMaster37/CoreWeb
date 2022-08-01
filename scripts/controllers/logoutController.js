//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('LogoutController', ['$window', '$rootScope', '$interval', 'localStorageService', function ($window, $rootScope, $interval, localStorageService) {

      localStorageService.remove('profile');
      localStorageService.remove('token');
      localStorageService.remove('acnames');
      localStorageService.remove('clist');
      localStorageService.remove('currencies');
      localStorageService.remove('rates');
      localStorageService.remove('providers');
      localStorageService.remove('dashMain');
      localStorageService.remove('dashcore_daily');
      //remove all intervals we have set
      $interval.cancel($rootScope.uintAcNames);
      $interval.cancel($rootScope.uintClist);
      $interval.cancel($rootScope.uintCurList);
      $interval.cancel($rootScope.uintRateList);
      $interval.cancel($rootScope.uintProvList);
      $interval.cancel($rootScope.uintReauthAction);
      $window.location.href = '/';
  }]);
  