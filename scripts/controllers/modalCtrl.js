//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('ModalCtrl', ['$scope', 'api','$location', 'ngProgressFactory', function ($scope, api, $location, ngProgressFactory) {
      if (api.isAuthed()) {


          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
      } else {
          $location.path('/login');
      }
    
  }]);
