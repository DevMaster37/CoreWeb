//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('ApiSettingsController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory) {
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
            var link = $("#account");
            var upSpeed     = 250;
            var downSpeed   = 250;
            link.addClass('open').next().slideDown(downSpeed);
                // Resize #page-content to fill empty space if exists
                setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                //$("#pblist").css('active');
        }
        
        $scope.progressbar.complete();
                    
        updateApiSettingView = function () {
            api.getProfile()
                .then(function (prof) {
                    $scope.profile = prof;

                    return api.getApiSettings();
                })
                .then(function (pr) {
                    $scope.apisettings = pr.apisettings;
                    $scope.load();
                })
        }
        
        $scope.apiSettingEdit = function (id) {
            $scope.recid = id;
            api.getApiSetting(id)
            .then(function (u) {
                $scope.rec = u;
                $scope.rec.status = $scope.rec.status == "1" ? true : false;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-edit-apisetting.html',
                    controller : 'UserListModalController',
                    scope : $scope
                });

                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateApiSettingView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            })
        }

        $scope.editApiSettingOK = function () {
            $scope.rec.status = $scope.rec.status ? "1" : "0";
            api.updateApiSetting($scope.rec._id, $scope.rec)
                .then(function (bc) {
                    $scope.modal.close();
                })
                .catch(function (err) {
                    $scope.modal.dismiss(err);
                })
        }

        updateApiSettingView();
    } else {
        $location.path('/login');
    }
}]);

  