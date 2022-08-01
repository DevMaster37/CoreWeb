//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
    .controller('TransactionController', ['$scope', '$filter', 'api', '$location', '$stateParams', 'ngProgressFactory', function ($scope, $filter, api, $location, $stateParams, ngProgressFactory) {
        if (api.isAuthed()) {
            var resizePageContent = function () {
                page = $('#page-container');
                pageContent = $('#page-content');
                header = $('header');
                footer = $('#page-content + footer');
                sidebar = $('#sidebar');
                sidebarAlt = $('#sidebar-alt');
                sScroll = $('.sidebar-scroll');

                var windowH = $(window).height();
                var sidebarH = sidebar.outerHeight();
                var sidebarAltH = sidebarAlt.outerHeight();
                var headerH = header.outerHeight();
                var footerH = footer.outerHeight();

                // If we have a fixed sidebar/header layout or each sidebars’ height < window height
                if (header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom') || ((sidebarH < windowH) && (sidebarAltH < windowH))) {
                    if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                        pageContent.css('min-height', windowH - headerH + 'px');
                    } else { // else if footer is static, remove its height
                        pageContent.css('min-height', windowH - (headerH + footerH) + 'px');
                    }
                } else { // In any other case set #page-content height the same as biggest sidebar's height
                    if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                        pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - headerH + 'px');
                    } else { // else if footer is static, remove its height
                        pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - (headerH + footerH) + 'px');
                    }
                }
            };
            $scope.load = function () {
                var link = $("#account");
                var upSpeed = 250;
                var downSpeed = 250;
                link.addClass('open').next().slideDown(downSpeed);
                // Resize #page-content to fill empty space if exists
                setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                $("#trlist").css('active');
            }

            $scope.progressbar = ngProgressFactory.createInstance();
            console.log($scope.progressbar);
            $scope.progressbar.start();

            api.getProfile()
                .then(function (prof) {
                    $scope.profile = prof;
                    $scope.progressbar.complete();
                });

            api.getTransactions($stateParams.id, 1)
                .then(function (c) {
                    var li =[];
                    if ($stateParams.transactions) {
                        var li = $stateParams.transactions.split(',');
                    }
                    $scope.progressbar.complete();
                    $scope.summary = {};
                    $scope.count = c.count;
                    $scope.data1 = [];
                    $scope.data = c.docs;
                    for (var i = 0; i < $scope.data.length; i++) {
                        for (var j = 0; j < li.length; j++) {
                            if ( $scope.data[i]._id == li[j] ) {
                                $scope.data1.push($scope.data[i]);
                            }
                        }
                    }

                    for (var i = 0; i < $scope.data1.length; i++) {
                        if ($scope.data1[i].type == "deb") {
                            var re = $scope.data1[i].description.split("paid with");
                            $scope.data1[i].description = re[0];
                        }
                    }

                    $scope.page = 1;
                    $scope.limit = 10;
                    return api.getAccounts();
                })
                .then(function (acc) {
                    var oo = [];
                    acc.accounts.forEach(function (f) {
                        oo[f._id] = f.account_name;
                    });
                    $scope.account_names = oo;
                    $scope.account_names[$scope.profile.main_account] = 'Me';
                    $scope.load();
                })
                .catch(function (err) {
                    console.log(err);
                })
        } else {
            $location.path('/login');
        }

    }]);