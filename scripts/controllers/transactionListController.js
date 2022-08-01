//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
    .controller('TransactionListController', ['$scope', 'api', '$location', '$stateParams', 'ngProgressFactory', '$window', 'localStorageService', 
    function ($scope, api, $location, $stateParams, ngProgressFactory, $window, localStorageService) {
        if (api.isAuthed()) {

            $scope.localTimezone = '' ;
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
                var link = $("#pinHead");
                var upSpeed = 250;
                var downSpeed = 250;
                link.addClass('open').next().slideDown(downSpeed);
                // Resize #page-content to fill empty space if exists
                setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                $("#trlist").css('active');
                $scope.localTimezone = $scope.filter.timezone;
                $scope.progressbar.complete();

            }

            api.getProfile()
                .then(function (prof) {
                    $scope.profile = prof;
                });

            api.getTransactionsAll(1)
                .then(function (c) {
                    $scope.progressbar = ngProgressFactory.createInstance();
                    $scope.progressbar.start();
                    $scope.filtered = false;
                    $scope.filterBase = '';
                    $scope.summary = {};
                    $scope.count = c.count;
                    $scope.data = c.docs;
                    //$scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = 10;

                    $scope.currencies = [];
                        var cur = localStorageService.get('currencies');
                    // api.getCurrencies().then(function (cur) {
                        for (var i = 0; i < cur.length; i++) {
                            for (var j = 0; j < $scope.currencies.length; j++) {
                                var s = 0;
                                if ($scope.currencies[j].symbol == cur[i].symbol) {
                                    s = 1;
                                    break;
                                }
                            }
                            if (s != 1) {
                                var o = {};
                                o.symbol = cur[i].symbol;
                                $scope.currencies.push(o);
                            }
                        }
                 //   })
                    // Topup request, Affiliate system, Refund system and System top-up
                    $scope.sources = new Array({sou: 'System top-up'},{sou: 'Refund system'}, {sou: 'Affiliate system'}, {sou: 'Topup request'}, {sou: 'System Refund'}, {sou: 'System'}, {sou: 'ePin purchase'});
                    for (var i = 0; i < $scope.data.length; i++) {
                        for (var j = 0; j < $scope.sources.length; j++) {
                            var s = 0;
                            if ($scope.sources[j].sou == $scope.data[i].source) {
                                s = 1;
                                break;
                            }
                        }
                        if (s != 1) {
                            var o = {};
                            o.sou = $scope.data[i].source;
                            $scope.sources.push(o);
                        }
                    }

                    for (var i = 0; i < $scope.data.length; i++) {
                        if ($scope.data[i].type == "deb") {
                            var re = $scope.data[i].description.split("paid with");
                            $scope.data[i].description = re[0];
                        }
                    }
                    return localStorageService.get('acnames');
                })
                .then(function (acc) {
                    var oo = [];
                    $scope.accounts = acc;
                    acc.forEach(function (f) {
                        oo[f._id] = f.account_name;
                    });
                    $scope.account_names = oo;
                    $scope.load();
                })
                .catch(function (err) {
                    console.log(err);
                })

            $scope.filter = {
                date_from: '',
                time_from: '',
                account: 'all',
                date_to: '',
                time_to: '',
                timezone: '',
                type: '',
                description: '',
                currency: '',
                wallet_id: '',
                source: '',
                transaction_id: ''
            };

            $scope.applyFilter = function () {
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                var filterparam = $scope.filter;
                if ($scope.filter.time_from != '') {
                    var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                    filterparam.time_from = date;
                }
                if ($scope.filter.time_to != '') {
                    var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                    filterparam.time_to = date;
                }
                api.getTransactionsFiltered(filterparam, $scope.page)
                    .then(function (c) {
                        if ($scope.filter.time_from != '') {
                            var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                            $scope.filter.time_from = date;
                        }
                        if ($scope.filter.time_to) {
                            var date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                            $scope.filter.time_to = date;
                        }
                        $scope.filtered = true;
                        $scope.count = c.count;
                        $scope.progressbar.complete();
                        $scope.data = c.docs;

                        for (var i = 0; i < $scope.data.length; i++) {
                            if ($scope.data[i].type == "deb") {
                                var re = $scope.data[i].description.split("paid with");
                                $scope.data[i].description = re[0];
                            }
                        }

                        $scope.page = c.page;
                        $scope.limit = 15;
                        $scope.filterBase = c.filter;
                        return localStorageService.get('acnames');
                    })
                    .then(function (acc) {
                        var oo = [];
                        acc.forEach(function (f) {
                            oo[f._id] = f.account_name;
                        });
                        $scope.account_names = oo;
                        $scope.account_names[$scope.profile.main_account] = 'Me';
                    })
                    .catch(function (err) {
                        console.log(err);
                        $scope.progressbar.complete();
                    })
            }

            $scope.clearFilter = function () {
                $scope.filtered = false;
                $scope.filterBase = '';
                $scope.filter = {
                    date_from: '',
                    time_from: '',
                    account: 'all',
                    date_to: '',
                    time_to: '',
                    timezone: '',
                    type: '',
                    description: '',
                    currency: '',
                    wallet_id: '',
                    source: '',
                    transaction_id: ''
                }
                $scope.filter.timezone = $scope.localTimezone;
                $scope.changePage(1);
                $scope.progressbar.complete();
            }

            $scope.changePage = function (pg) {
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                $scope.page = pg;
                if ($scope.filtered) {
                    if ($scope.filter.time_from != '') {
                        var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                        filterparam.time_from = date;
                    }
                    if ($scope.filter.time_to != '') {
                        var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                        filterparam.time_to = date;
                    }
                    api.getTransactionsFiltered($scope.filter, $scope.page)
                        .then(function (c) {
                            if ($scope.filter.time_from != '') {
                                var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                                $scope.filter.time_from = date;
                            }
                            if ($scope.filter.time_to) {
                                var date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                                $scope.filter.time_to = date;
                            }
                            $scope.count = c.count;
                            $scope.data = c.docs;
                            for (var i = 0; i < $scope.data.length; i++) {
                                if ($scope.data[i].type == "deb") {
                                    var re = $scope.data[i].description.split("paid with");
                                    $scope.data[i].description = re[0];
                                }
                            }
                            $scope.page = c.page;
                            $scope.limit = 20;
                            $scope.filterBase = c.filter;
                            return localStorageService.get('acnames');
                        })
                        .then(function (acc) {
                            var oo = [];
                            acc.forEach(function (f) {
                                oo[f._id] = f.account_name;
                            });
                            $scope.account_names = oo;
                            $scope.account_names[$scope.profile.main_account] = 'Me';
                            $scope.progressbar.complete();
                        })
                        .catch(function (err) {
                            console.log(err);
                            $scope.progressbar.complete();
                        })
                } else {
                    api.getTransactionsAll($scope.page)
                        .then(function (c) {
                            if ($scope.filter.time_from != '') {
                                var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                                $scope.filter.time_from = date;
                            }
                            if ($scope.filter.time_to) {
                                var date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                                $scope.filter.time_to = date;
                            }
                            $scope.count = c.count;
                            $scope.data = c.docs;
                            for (var i = 0; i < $scope.data.length; i++) {
                                if ($scope.data[i].type == "deb") {
                                    var re = $scope.data[i].description.split("paid with");
                                    $scope.data[i].description = re[0];
                                }
                            }
                            $scope.page = c.page;
                            $scope.limit = 25;
                            return localStorageService.get('acnames');
                        })
                        .then(function (acc) {
                            var oo = [];
                            acc.forEach(function (f) {
                                oo[f._id] = f.account_name;
                            });
                            $scope.account_names = oo;
                            $scope.load();
                        })
                        .catch(function (err) {
                            console.log(err);
                            $scope.progressbar.complete();
                        })
                }
            }
            $scope.popup1 = {
                opened: false
            };
            $scope.popup2 = {
                opened: false
            }
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };
            $scope.open2 = function () {
                $scope.popup2.opened = true;
            }
        } else {
            $location.path('/login');
        }

    }]);

  