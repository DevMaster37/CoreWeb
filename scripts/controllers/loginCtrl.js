//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('LoginCtrl', ['$scope', 'api','$location', '$rootScope', '$window', 'ngProgressFactory', '$interval', 'localStorageService',
  function ($scope, api, $location, $rootScope, $window, ngProgressFactory, $interval, localStorageService) {
      if (api.isAuthed()) {
          $location.path('/');
      }
      $scope.checkEvt = function (evt) {
          console.log('KeyEVT');
        if (evt.which === 13) {
            console.log('ENTER=EVT')
            $scope.authenticate();
        }
      }
      $scope.initShort = function () {
        return new Promise(function (resolve,reject) {
          if (api.isAuthed()) {
              //Preload stuff and save it to the browser;

              //Account Names
              api._get('/accounts/names')
                  .then(function (an) {
                      localStorageService.set('acnames', an);
                      return api._get('/countries')
                  })
                  .then(function (x) {
                      localStorageService.set('clist', x);
                      return api._get('/currencies')
                  })
                  .then(function (x) {
                      localStorageService.set('currencies', x);
                      return api._get('/rates');
                  })
                  .then(function (x) {
                      localStorageService.set('rates', x);
                     resolve();

                    // return api.getDashboard();
                  })
                  .catch(function (e) {
                      console.log('GOT e in LOGIN module (catch)', e);
                      reject();
                  })
              //Country List
              //currency List
              //Rates
            } else {
                reject();
            }
        })
        
    }
      $scope.initLoginProcesses = function () {
          return new Promise(function (resolve,reject) {
            if (api.isAuthed()) {
                //Preload stuff and save it to the browser;

                //Account Names
                api._get('/accounts/names')
                    .then(function (an) {
                        localStorageService.set('acnames', an);
                        return api._get('/countries')
                    })
                    .then(function (x) {
                        localStorageService.set('clist', x);
                        return api._get('/currencies')
                    })
                    .then(function (x) {
                        localStorageService.set('currencies', x);
                        return api._get('/rates');
                    })
                    .then(function (x) {
                        localStorageService.set('rates', x);
                       // resolve();

                       return api.getDashboard();
                    })
                    .then(function (x) {
                        localStorageService.set('dashMain', x);
                        return api.getCoreDashboard('daily');
                    })
                    .then(function (x) {
                        localStorageService.set('dashcore_daily', x);
                        return api._get('/providers')
                    })
                    .then(function (x) {
                        localStorageService.set('providers', x);
                        resolve();
                    })
                    .catch(function (e) {
                        console.log('GOT e in LOGIN module (catch)', e);
                        reject();
                    })
                //Country List
                //currency List
                //Rates
              } else {
                  reject();
              }
          })
          
      }
     
    $scope.authenticate = function () {
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.start();
        var user = $scope.user;
        api.login(user)
        .then(function (profile) {
            api.setProfile(profile);
            $scope.prf = profile;
           if (profile.access_level == 'master') {
            return $scope.initLoginProcesses();
           } else {
               return $scope.initShort();
           }
          
        })
        .then(function (x) {
            //setup intervals
            $scope.progressbar.complete();
            if ($scope.prf.access_level == 'master') {
                $location.path('/dashboard');
            } else {
                $location.path('/topuplogs');
            }
           // $location.path('/dashboard');
            
        })
       
        .catch(function (err) {
            if (err.status == '401') {
                //unauth
                $scope.err = true;
                $scope.user.username = '';
                $scope.user.password = '';
            }
        })
    };
  }]);
