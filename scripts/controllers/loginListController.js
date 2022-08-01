//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
.controller('LoginListController', ['$scope', 'api','$location', '$stateParams', 'ngProgressFactory', '$rootScope', function ($scope, api, $location, $stateParams, ngProgressFactory, $rootScope) {
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
                   $("#lglist").css('active');
        
              }
        api.getProfile()
  .then(function (prof) {
      $scope.profile = prof;
      $scope.progressbar.complete();
      $scope.page = 1;
      $scope.changePage($scope.page);
  });
  
      $scope.changePage = function (pg) {
          $scope.page = pg;
           api._get('/loginlogs/' + $scope.page)
                 .then(function (c) {
                  $scope.count = c.count;
                  $scope.data = c.docs;
                  $scope.pages = c.pages;
                  $scope.page = c.page;
                  $scope.limit = c.limit;
          //return api.getAccounts();
          $scope.account_names = $rootScope.account_names();
          $scope.load();
      })
     
       .catch(function (err) {
                  console.log(err);
              })
      }
    } else {
        $location.path('/login');
    }
  
}]);

