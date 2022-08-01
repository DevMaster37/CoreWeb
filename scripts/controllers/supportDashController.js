//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('SupportDashController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory) {
      if (api.isAuthed()) {

        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.stats = [];
        $scope.stats['srate'] = [];
        $scope.stats['rtimes'] = [];
        $scope.stats['ltx'] = [];
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
                     $("#clinks").css('active');
          
                }
                $scope.progressbar.complete();
               
                   $scope.parseStats = function (input) {
                       input.forEach(function (z) {
                           if (z.type == 'ltx') {
                            var tempArr = [];
                            z.values.forEach(function (yy) {
                                tempArr[yy.key] = yy.val;
                            })
                          //  console.log(z.type, tempArr)
                            $scope.stats[z.type] = tempArr;
                           } else {
                         //   console.log('Z', z);
                            var tempArr = [];
                             z.values.forEach(function (yy) {
                                 tempArr[yy.key] = yy.val;
                             })
                          //   console.log(z.type, z.timedef, tempArr)
                             $scope.stats[z.type][z.timedef] = tempArr;
                           }
                         
                       })
                   } 
   $scope.updateStats = function () {
        api._get('/rtstats')
            .then(function (x) {
                $scope.parseStats(x);
            })
   }

          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
       
    });
    $scope.load();
    $scope.updateStats();
    setInterval($scope.updateStats, 10000)
      } else {
          $location.path('/login');
      }
    
  }]);
  angular.module('billinguiApp')
  .controller('SupportDashModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
      $scope.createLinkOK = function () {
          if ($scope.rate.active) {

          } else {
              $scope.rate.active = false;
          }
          api._post('/commlinks', $scope.rate)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
         $scope.editLinkOK = function () {
            
          api._put('/commlinks/' + $scope.recid, $scope.rate)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
      $scope.deleteLinkOK = function () {
          api._delete('/commlinks/' + $scope.recid)
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
  