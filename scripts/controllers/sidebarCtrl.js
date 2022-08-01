//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('SidebarCtrl', ['$scope', 'api','$location', '$uibModal', '$timeout', '$translate', '$rootScope', '$window', '$interval', 'localStorageService', function ($scope, api, $location, $uibModal, $timeout, $translate, $rootScope, $window, $interval, localStorageService) {
      if (api.isAuthed()) {
            api.getProfile()
            .then(function (prof) {
                $scope.profile = prof;
                if (typeof prof.avatar !== 'undefined') {
                    $scope.avatarUrl = '/img/' + prof.avatar;
                } else {
                    $scope.avatarUrl = 'images/placeholders/avatars/avatar.png';
                }
                $scope.lang = $translate.proposedLanguage() || $translate.use();

            });
            
            $rootScope.updateAcNames = function () {
                api._get('/accounts/names')
                    .then(function (x) {
                        localStorageService.set('acnames', x);
                    })
            }
            $rootScope.updateCountryList = function () {
                api._get('/countries')
                    .then(function (x) {
                        localStorageService.set('clist', x);
                    })
            }
            $rootScope.updateCurrencies = function () {
                api._get('/currencies')
                    .then(function (x) {
                        localStorageService.set('currencies', x);
                    })
            }
            $rootScope.updateRates = function () {
                api._get('/rates')
                    .then(function (x) {
                        localStorageService.set('rates', x);
                    })
            }
            $rootScope.updateProviders = function () {
                api._get('/providers')
                    .then(function (x) {
                        localStorageService.set('providers', x);
                    })
            }
            $rootScope.updateDash = function () {
                api.getDashboard()
                    .then(function (x) {
                        localStorageService.set('dashMain', x);
                    })
            }
            $rootScope.updateCoreDashDaily = function () {
                api.getCoreDashboard('daily')
                    .then(function (x) {
                        localStorageService.set('dashcore_daily', x, 0.2);
                        $rootScope.$emit('update_core_dash_daily', x);
                    })
            }
            $scope.initIntervals = function () {
                console.log('BOOBOOINRI')
            //  return new Promise(function (resolve,reject) {
                    //AcNames = 900s  
                    if ($rootScope.uintAcNames) {
                        $interval.cancel($rootScope.uintAcNames)
                    }
                $rootScope.uintAcNames = $interval($rootScope.updateAcNames, 900000);
                //CList 86400s
                if ($rootScope.uintClist) {
                    $interval.cancel($rootScope.uintClist);
                }
                $rootScope.uintClist = $interval($rootScope.updateCountryList, 86400000);
                //Currencies 86400s
                if ($rootScope.uintCurList) {
                    $interval.cancel($rootScope.uintCurList);
                }
                $rootScope.uintCurList = $interval($rootScope.updateCurrencies, 86400000);
                //Rates 86400s
                if ($rootScope.uintRateList) 
                {
                    $interval.cancel($rootScope.uintRateList);
                }
                $rootScope.uintRateList = $interval($rootScope.updateRates, 86400000);
                //Provider list every 30m
                if ($rootScope.uintProvList) {
                    $interval.cancel($rootScope.uintProvList);
                }
                $rootScope.uintProvList = $interval($rootScope.updateProviders, 1800000);
                //Reauth Interval
                if ($rootScope.uintReauthAction) {
                    $interval.cancel($rootScope.uintReauthAction);
                }
                $rootScope.uintReauthAction = $interval(api.reauth, 3600000);
                if ($rootScope.uintdcore_Daily) {
                    $interval.cancel($rootScope.uintdcore_Daily);
                }
                $rootScope.uintdcore_Daily = $interval($rootScope.updateCoreDashDaily, 900000);
                if ($rootScope.uintdashMain) {
                    $interval.cancel($rootScope.uintdashMain);
                }
                $rootScope.uintdashMain = $interval($rootScope.updateDash, 900000);
            }

            $scope.setLang = function () {
                $translate.use($scope.lang);
            }
            $scope.editProfile = function () {
                api.getUser($scope.profile.main_account, $scope.profile._id)
                .then(function (u) {
                    $scope.user = u;
                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-edit-user.html',
                        controller : 'SidebarModalController',
                        scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                        $timeout(function () {
                            api.updateProfile()
                                .then(function (prof) {
                                    $scope.profile = prof;
                                })
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
            }
            $scope.initIntervals();
      } else {
          $location.path('/login');
      }
    
  }]);
 
 angular.module('billinguiApp')
    .controller('SidebarModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
        $scope.load = function () {
            console.log('ARRRGGGH')
            console.log($('.active'))
        }
        $scope.newUserCancel = function () {
            $uibModalInstance.dismiss();
        }
        $scope.editUserOK = function () {
            var nobj = {};
            for (key in $scope.user) {
                if ((key == 'main_account') || (key == '__v') || (key == '_id') || (key == 'createdAt') || (key == 'last_login') || (key == 'updatedAt') || (key == 'password') || (key == 'passwordconfirm'))
                    continue;
                nobj[key] = $scope.user[key];
            }
            if ($scope.user.password) {
                if ($scope.user.password == $scope.user.passwordconfirm) {
                    //ok 
                    nobj.password = $scope.user.password;
                }
            }
            //update....
            api.editUser($scope.profile.main_account, $scope.profile._id, nobj)
                .then(function (u) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
            }
        $scope.uploadAvatar = function(file, errFiles) {
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                file.upload = Upload.upload({
                    url: '/v1/accounts/' + $scope.profile.main_account + '/users/' + $scope.profile._id + '/avatar?token=' + $scope.profile.token,
                    data: {userPhoto: file}
                });

                file.upload.then(function (response) {
                    $timeout(function () {
                        file.result = response.data;
                    });
                }, function (response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 * 
                                            evt.loaded / evt.total));
                });
            }   
        }
        $scope.load();
    }]);
