//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */

angular.module('billinguiApp')
  .controller('PinSearchController', ['$scope', 'api','$location', 'ngProgressFactory', function ($scope, api, $location, ngProgressFactory) {
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
                    var link = $("#pins");
                    var upSpeed     = 250;
                    var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                    $("#ps").css('active');
                }
                $scope.progressbar.complete();
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
                $scope.Pins = {};
                $scope.PinProperty = 0 ;
                $scope.currencies = [];
                $scope.page = 1 ;
                $scope.filtered = false ;
                $scope.filter = {
                    date_from : '',
                    time_from : '',
                    timezone   : '',
                    callerID   : '',
                    serial     : '',
                    currency   : '',
                    topupnumber: '',
                    type       : '',
                    date_to   : '',
                    time_to   : '',
                    pin        : '',
                    value      : '',
                    valid      : '',
                    used       : ''
                };
                api.getAccounts()
                    .then(function (acc) {
                        $scope.progressbar = ngProgressFactory.createInstance();
                        $scope.progressbar.start();
                        $scope.account_names = [];
                        acc.accounts.forEach(function (f) {
                            $scope.account_names[f._id] = f.account_name;
                        })
                        return api.getCurrencies();
                    })
                    .then(function (cur) {
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
                        return api.getAllPin($scope.page);
                    })
                    .then(function(allPins){
                        $scope.Pins = allPins.entries ;
                        $scope.count = allPins.count;
                        $scope.limit = allPins.limit;
                        $scope.localTimezone = $scope.filter.timezone ;
                        $scope.progressbar.complete();
                    })
                    .catch(function (err) {
                        $scope.progressbar.complete();
                        console.log(err);
                    })

                $scope.pinRelation = function(info){
                    $scope.topupInfo = [];
                    $scope.transaction = [];
                    api.pinRelationTopup({ topupnumber : info.topupnumber })
                    .then(function(ret){
                       ret.forEach(function(line){
                            if(info.used_date.split(".")[0] == line.updatedAt.split(".")[0])
                            {
                                $scope.topupInfo.push(line) ;
                            }
                       })
                       if($scope.topupInfo.length !=0)
                       {
                           return api.pinRelationTransaction({ ids : $scope.topupInfo[0].related_transactions})
                       }
                    })
                    .then(function(ret){
                        $scope.transaction = ret ;
                        $scope.PinProperty = 2 ;
                    })
                }
                
                $scope.changePage = function(page){
                    $scope.page = page ;
                    $scope.progressbar.start();
                    if($scope.filtered)
                    {
                        var filterparam = $scope.filter;
                        if ($scope.filter.time_from != '') {
                            var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                            filterparam.time_from = date;
                        }
                        if ($scope.filter.time_to != '') {
                            var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                            filterparam.time_to = date;
                        }
                        api.PinApplyFilter(filterparam,$scope.page)
                        .then(function(filterdPin){
                            if ($scope.filter.time_from != '') {
                                var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                                $scope.filter.time_from = date;
                            }
                            if ($scope.filter.time_to != '') {
                                date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                                $scope.filter.time_to = date;
                            }
                            $scope.Pins = filterdPin.entries ;
                            $scope.count = filterdPin.count;
                            $scope.limit = filterdPin.limit;
                            $scope.filterBase =filterdPin.filter;
                            $scope.filtered = true; // added
                            $scope.progressbar.complete();
                        })
                        .catch(function (err) {
                            console.log(err);
                            $scope.progressbar.complete();
                        })
                    }else{
                        api.getAllPin($scope.page)
                        .then(function(allPins){
                            $scope.Pins = allPins.entries ;
                            $scope.count = allPins.count;
                            $scope.limit = allPins.limit;
                            $scope.progressbar.complete();
                        }).catch(function (err) {
                            console.log(err);
                            $scope.progressbar.complete();
                        })
                    }
                };
                $scope.PinapplyFilter = function(){
                    
                    var filterparam = $scope.filter;
                    if ($scope.filter.time_from != '') {
                        var date = new Date($scope.filter.time_from.getTime() - (60000 * $scope.filter.time_from.getTimezoneOffset()));
                        filterparam.time_from = date;
                    }
                    if ($scope.filter.time_to != '') {
                        var date = new Date($scope.filter.time_to.getTime() - (60000 * $scope.filter.time_to.getTimezoneOffset()));
                        filterparam.time_to = date;
                    }

                    api.PinApplyFilter(filterparam,$scope.page)
                    .then(function(filterdPin){
                        if ($scope.filter.time_from != '') {
                            var date = new Date($scope.filter.time_from.getTime() + (60000 * $scope.filter.time_from.getTimezoneOffset()));
                            $scope.filter.time_from = date;
                        }
                        if ($scope.filter.time_to != '') {
                            date = new Date($scope.filter.time_to.getTime() + (60000 * $scope.filter.time_to.getTimezoneOffset()));
                            $scope.filter.time_to = date;
                        }
                        $scope.Pins = filterdPin.entries ;
                        $scope.count = filterdPin.count;
                        $scope.limit = filterdPin.limit;
                        $scope.filterBase =filterdPin.filter;
                        $scope.filtered = true; // added
                        $scope.progressbar.complete();
                    })
                    .catch(function (err) {
                        console.log(err);
                        $scope.progressbar.complete();
                    })

                };
                $scope.clearFilter = function () {
                    $scope.filtered = false;
                    $scope.filterBase = '';
                    $scope.filter = {
                        date_from : '',
                        time_from : '',
                        timezone   : '',
                        callerID   : '',
                        serial     : '',
                        currency   : '',
                        topupnumber: '',
                        type       : '',
                        date_to   : '',
                        time_to   : '',
                        pin        : '',
                        value      : '',
                        valid      : '',
                        used       : ''
                    };
                    $scope.filter.timezone = $scope.localTimezone  ;
                    $scope.changePage(1)
                };
                $scope.getPinById = function(pin) {
                    api.getPin(pin)
                    .then(function(p) {
                        $scope.obj = p;
                        $scope.PinProperty = 1;
                    })
                }
                $scope.resetPin = function(){
                    $scope.PinProperty = 0 ;
                };
                $scope.enabledisablePin = function (pin_info){
                    api.getPin(pin_info._id)
                    .then(function(p) {
                        return  api.invalidatePin(p.batch_id,p._id,pin_info.valid)
                    })
                    .then(function(ret){
                        
                    })
                    .catch(function(err){
                        console.log(err);
                    })
                };
      } else {
        $location.path('/');
      }

  }]);
