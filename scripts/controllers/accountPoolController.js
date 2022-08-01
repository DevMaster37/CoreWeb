//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('AccountPoolController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory) {
      if (api.isAuthed()) {

        $scope.progressbar = ngProgressFactory.createInstance();
        console.log($scope.progressbar);
        $scope.progressbar.start();
          var resizePageContent = function() {
                     page            = $('#page-container');
        pageContent     = $('#page-content');
        header          = $('header');
        footer          = $('#page-content + footer');
        sidebar         = $('#sidebar');
        sidebarAlt      = $('#sidebar-alt');
        sScroll         = $('.sidebar-scroll');

        var windowH         = $(window).height();
        var sidebarH        = sidebar.outerHeight();
        var sidebarAltH     = sidebarAlt.outerHeight();
        var headerH         = header.outerHeight();
        var footerH         = footer.outerHeight();

        // If we have a fixed sidebar/header layout or each sidebars’ height < window height
        if (header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom') || ((sidebarH < windowH) && (sidebarAltH < windowH))) {
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', windowH - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', windowH - (headerH + footerH) + 'px');
            }
        }  else { // In any other case set #page-content height the same as biggest sidebar's height
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - (headerH + footerH) + 'px');
            }
        }
    };
            $scope.load = function () {
                  var link = $("#pinHead");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                     $("#apools").css('active');
          
                }
                $scope.progressbar.complete();
                $scope.newLink = function () {
                    $scope.rec = {};
                    $scope.rec.connectionProtocol = 'evc';
                    $scope.rec.connectionMode = 'direct';
                    $scope.rec.srcNum = '';
                    
                    $scope.modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'views/partials/modal-new-apool.html',
            controller : 'AccountPoolModalController',
            scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
            $timeout(function () {
               api._get('/acclinks')
        .then(function (r){
            $scope.accounts = r.accounts;
            $scope.load();
            
        })
     .catch(function (err) {
            throw err;
        })
            });
            }, function () {
            console.log('but i waz dizmizeddd')
            });
        }
                    updateCredentialView = function () {
                        api.getProfile()
                            .then(function (prof) {
                                $scope.profile = prof;

                                return api._get('/acclinks');
                            })
                            .then(function (pr) {
                                $scope.accounts = pr.accounts;
                                $scope.load();
                            })
                    }

                         $scope.linkEdit = function (id) {
                             $scope.recid = id;
        api._get('/acclinks/' + id)
        .then(function (u) {
            $scope.rec = u;
            $scope.rec.srcNum = '';
            var r = '';
            $scope.rec.sourceNumbers.forEach(function (l) {
                r += l + ',';
  
            })
            $scope.rec.srcNum = r.substring(0, r.length-1);
            $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-apool.html',
      controller : 'AccountPoolModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateCredentialView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
        })
        
    }
    $scope.linkDelete = function (id) {
        $scope.recid = id;
api._get('/acclinks/' + id)
.then(function (u) {
$scope.rate = u;

$scope.modal = $uibModal.open({
animation: true,
ariaLabelledBy: 'modal-title',
ariaDescribedBy: 'modal-body',
templateUrl: 'views/partials/modal-delete-apool.html',
controller : 'AccountPoolModalController',
scope : $scope
});
$scope.modal.result.then(function (selectedItem) {
$timeout(function () {
updateCredentialView();
});
}, function () {
console.log('but i waz dizmizeddd')
});
})

}

          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    api._get('/acclinks')
        .then(function (r){
            $scope.accounts = r.accounts;
            $scope.load();
        })

      } else {
          $location.path('/login');
      }
    
  }]);
  angular.module('billinguiApp')
  .controller('AccountPoolModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
      $scope.createLinkOK = function () {
          if ($scope.rec.active) {

          } else {
              $scope.rec.active = false;
          }
          
          api._post('/acclinks', $scope.rec)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
         $scope.editLinkOK = function () {
            
          api._put('/acclinks/' + $scope.recid, $scope.rec)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
      $scope.deleteLinkOK = function () {
          api._delete('/acclinks/' + $scope.recid)
              .then(function (f) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }

      $scope.invalidatePinOK = function () {

          api.invalidatePin($scope.batchid, $scope.pinid)
              .then(function (z) {
                  $uibModalInstance.close();
              })
               .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
          $scope.invalidateBatchOK = function () {
          api.invalidateBatch($scope.batchid)
              .then(function (z) {
                  $uibModalInstance.close();
              })
               .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
      $scope.cancel = function () {
          $uibModalInstance.dismiss();
      }
      $scope.newUserCancel = function () {
        $uibModalInstance.dismiss();
    }
         $scope.popup1 = {
          opened: false
      };
      $scope.popup2 = {
          opened: false
      }
       $scope.open1 = function() {
          $scope.popup1.opened = true;
      };
      $scope.open2 = function () {
          $scope.popup2.opened = true;
      }
        }]);
  