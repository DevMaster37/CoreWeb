//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
    .controller('TopupListController', ['$scope', '$interval', 'api', '$location', '$stateParams', '$uibModal', 'ngProgressFactory', '$rootScope', '$window', 'SweetAlert', 'localStorageService',
    function ($scope, $interval, api, $location, $stateParams, $uibModal, ngProgressFactory, $rootScope, $window, SweetAlert, localStorageService) {
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
            
            $scope.localTimezone = '';
            $scope.applied = false ;
            $scope.load = function () {
                var link = $("#pinHead");
                var upSpeed = 250;
                var downSpeed = 250;
                link.addClass('open').next().slideDown(downSpeed);
                // Resize #page-content to fill empty space if exists
                setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                $("#tolist").css('active');

            }
            api.getProfile().then(function (prof) {
                $scope.profile = prof;
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                $scope.filtered = false;
                $scope.filterBase = '';
                $scope.summary = {};
                $scope.filter = {
                    date_from: '',
                    time_from: '',
                    date_to: '',
                    time_to: '',
                    timezone: '',
                    account: 'all',
                    customer_reference: '',
                    operator_reference: '',
                    success: '',
                    code: '',
                    product_id: '',
                    target: '',
                    country: '',
                    operator_name: '',
                    channel: '',
                    vnd_sim: '',
                    api_transactionid: '',
                    currency: '',
                    wholesaler: '',
                    tag:'',
                    type : ''
                }

                return localStorageService.get('acnames');
            })
                .then(function (acc) {
                    var oo = [];
                    $scope.onlyAgent =[];
                    $scope.onlyWholesaler = [];
                    for (var i = 0; i < acc.length ; i++) {
                        var x = acc[i];
                        oo[x._id] = x.account_name;
                    }
                   
                    $scope.account_names = oo;
                    $scope.accounts = acc;
                    

                    return localStorageService.get('clist');

                })
                .then(function (bcc) {
                    $scope.countries = bcc;
                    $scope.load();
                    $scope.page = 1;
                    $scope.changePage($scope.page);
                    $scope.localTimezone = $scope.filter.timezone ;
                    $scope.currencies = [];
                    return localStorageService.get('currencies');
                }).then(function (cur) {
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
                    return false;
                }).then(function(ops){
                    $scope.operators = [];
                    /*
                    for(var i = 0 ; i < ops.operators.length;i++)
                    {
                        if(!$scope.operators.contains(ops.operators[i].operator_name) && ops.operators[i].operator_name !='')
                        {
                            $scope.operators.push(ops.operators[i].operator_name);
                        }
                    }
                    */
                })
                .catch(function (err) {
                    console.log(err);
                });

            var timer_flag = true;
            $scope.live_stream = false;
            var startTimer = function () {
                $scope.timer = $interval(function () {
                    if (timer_flag) {
                        timer_flag = false;
                        $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                        api._get('/topuplog/1??fields=account,type,vnd_sim,app_host,operator_reference,customer_reference,api_transactionid,time,target,product_id,country,operator_name,topup_amount,topup_currency,success,code,message,completed_in,channel,related_transactions,tag,route_tag,wholesaler,state')
                            .then(function (c) {
                                $scope.data = c.docs;
                                timer_flag = true;
                                $scope.progressbar.complete();
                            })
                    }
                }, 3000);
            }
            var killTimer = function () {
                timer_flag = true;
                $interval.cancel($scope.timer);
            }

            $scope.liveStreamStatus = function () {
                if (this.live_stream) {
                    timer_flag = true;
                    startTimer();
                } else {
                    killTimer();
                }
            }

            $scope.TopupsapplyFilter = function () {
                this.live_stream = false ;
                killTimer();
                $scope.filterBase = '';
                var filterparam = $scope.filter;
                if ($scope.filter.time_from != '') {
                    var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                    filterparam.time_from = date;
                }
                if ($scope.filter.time_to != '') {
                    var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                    filterparam.time_to = date;
                }
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();

                api.getTopupsFilter(filterparam, $scope.page)
                    .then(function (c) {
                        $scope.progressbar.complete();
                        if ($scope.filter.time_from != '') {
                            var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                            $scope.filter.time_from = date;
                        }
                        if ($scope.filter.time_to != '') {
                            date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                            $scope.filter.time_to = date;
                        }
                        $scope.count = c.count;
                        $scope.data = c.docs;
                        $scope.limit = 20;
                        $scope.filterBase = c.filter;
                        $scope.summary = c.summary;
                        $scope.filtered = true; // added
                       
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }
            $scope.clearFilter = function () {
                $scope.filtered = false;
                $scope.filterBase = '';
                $scope.filter = {
                    date_from: '',
                    time_from: '',
                    date_to: '',
                    time_to: '',
                    timezone: '',
                    account: 'all',
                    customer_reference: '',
                    operator_reference: '',
                    success: '',
                    code: '',
                    product_id: '',
                    target: '',
                    country: '',
                    operator_name: '',
                    channel: '',
                    vnd_sim: '',
                    api_transactionid: '',
                    currency: '',
                    tag :'',
                    type : ''
                }
                $scope.filter.timezone = $scope.localTimezone;
                $scope.changePage(1)
            }

            $scope.changePage = function (pg) {
                $scope.page = pg;
                if ($scope.filtered) {
                    var filterparam = $scope.filter;
                    if ($scope.filter.time_from != '') {
                        var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                        filterparam.time_from = date;
                    }
                    if ($scope.filter.time_to != '') {
                        var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                        filterparam.time_to = date;
                    }
                    api.getTopupsFilter(filterparam, $scope.page)
                        .then(function (c) {
                            if ($scope.filter.time_from != '') {
                                var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                                $scope.filter.time_from = date;
                            }
                            if ($scope.filter.time_to != '') {

                                var date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                                $scope.filter.time_to = date;
                            }
                            $scope.count = c.count;
                            $scope.data = c.docs;

                            $scope.limit = 10;
                            $scope.filterBase = c.filter;
                            $scope.summary = c.summary;
                            $scope.progressbar.complete();
                        })
                        .catch(function (err) {
                            console.log(err);
                        })
                } else {
                    api._get('/topuplog/' + $scope.page + '?fields=account,type,vnd_sim,app_host,operator_reference,customer_reference,api_transactionid,time,target,product_id,country,operator_name,topup_amount,topup_currency,success,code,message,completed_in,channel,related_transactions,tag,wholesaler,route_tag,state')
                        .then(function (c) {
                            $scope.count = c.count;
                            $scope.data = c.docs;
                            $scope.page = c.page;
                            $scope.limit = 15;
                            $scope.progressbar.complete();
                        })
                        .catch(function (err) {
                            console.log(err);
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
            $scope.showLog = function (id) {
                $scope.recid = id;
                api.getTopup(id)
                    .then(function (t) {
                        $scope.rec = t;
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-view-log.html',
                            controller: 'AccountsModalController',
                            scope: $scope
                        });
                        $scope.modal.result.then(function (selectedItem) {

                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })

            }
            $scope.refundTx = function () {
                api._get('/topuplog/item/' + $scope.recid + '/refund')
                    .then(function (t) {
                        $scope.rec = t;
                        SweetAlert.swal({
                            title: "Good Job!",
                            text: "TopupLog has been refunded!",
                            type: "success",
                            closeOnConfirm: true
                        }, function (ok) {
                            if (ok) {
                                $uibModalInstance.dismiss();
                            }

                        });
                    })
                    $uibModalInstance.dismiss();
                    $scope.modal.result.then(function (selectedItem) {
                        

                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
            }
        } else {
            $location.path('/login');
        }

    }]);

  
