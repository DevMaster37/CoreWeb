//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('EpinBatchListController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', '$rootScope', 'SweetAlert', 'ngProgressFactory', function ($scope, api, $location, $stateParams, $uibModal, $timeout, $rootScope, SweetAlert, ngProgressFactory) {
      if (api.isAuthed()) {
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
                     $("#pblist").css('active');
          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    var updateBatchList = function () {
        $scope.showDem = false;
         api.getEpins()
    .then(function (pi) {
        $scope.batches = pi.batches;
        $scope.bcount = pi.count;
        $scope.account_names = []
        $scope.qty = [];
        $scope.load();
        if ($scope.profile.account_type !== 'agent') {
            return api.getAccounts();
        } else {
            return true;
        }
    })
    .then(function (acc) {
         if ($scope.profile.account_type !== 'agent') {
             acc.accounts.forEach(function (f) {
                 $scope.account_names[f._id] = f.account_name;
             })
           $scope.account_names[$scope.profile.main_account] = 'Me'
        } 
        return api.getCurrencies()
    })
    .then(function (c) {
                    $scope.currencies = [];
                   c.forEach(function (ca) {
                        $scope.currencies[ca.symbol] = ca.name;
                   })
                })
     .catch(function (err) {
            throw err;
        })
    }
    var updatePurchaseList = function () {
        $scope.pcount = 0;
        api.getPurchaseList()
            .then(function (plist) {
                $scope.pcount = plist.count;
                $scope.plist = plist.orders;
            })
    }
  updateBatchList();
  updatePurchaseList();
  $scope.buyEpin = function (sku) {
      var qty = $scope.qty[sku];
      if (qty > 0) {
        $scope.canBuy = true;
      $scope.progressbar = ngProgressFactory.createInstance();
       SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You are about to buy " + qty + " x " + sku.split('-')[2] + " ePins",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#578022",
                            confirmButtonText: "Yes, go ahead!",
                            closeOnConfirm: false}, 
                            function(isConfirm){ 

                                if (isConfirm) {
                                    if ($scope.canBuy) {
                                         $scope.err = false;
                            $scope.obj = {
                                quantity : qty,
                                sku : sku
                            }
                            $scope.progressbar.start();
                            $scope.canBuy = false;
                            api.buyEpin($scope.obj)
                                .then(function (resp) {
                                    $scope.progressbar.complete();
                                    SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "You have successfully purchased ePins!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $rootScope.updateBalance()
                                            updateBatchList();
                                            updatePurchaseList();
                                        }
                                        
                                    });
                                })
                                .catch(function (er) {
                                    $scope.progressbar.complete();
                                    console.log(er);
                                    $scope.emsg = er.data.status + ' - ' + er.data.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                                })
                                }
                                   
                                } else {

                                }
                                
                            });
      }
      
  }
    $scope.updatePinRate = function () {
        var ob = {
            type : $scope.batch.type,
            currency : $scope.batch.currency
        }
        api.getPinRates(ob)
            .then(function (ra) {
                $scope.pinrate = 1
                return ra.rate;
            })
            .then(function (rat) {
                            $scope.raz = {};
                $scope.raz.currency = $scope.batch.currency;
                $scope.raz.reverse = false;
            if ($scope.myCur.contains($scope.batch.currency)) {
                $scope.raz = {};
                $scope.raz.myrate =  $scope.pinrate;
                $scope.raz.currency = $scope.batch.currency;
                $scope.raz.reverse = false;
            } else {
                var rara = $scope.rates.filter(function (e) { return ( (e.source == $rootScope.mypriwal.currency) && e.destination == $scope.batch.currency) });
                if (rara.length > 0) {
                    $scope.raz.myrate = rara[0].rate * $scope.pinrate;
                    $scope.raz.currency = $rootScope.mypriwal.currency;
                    $scope.raz.reverse = true;
                } else {
                    var rarb = $scope.rates.filter(function (e) { return ( (e.destination == $rootScope.mypriwal.currency) && e.source == $scope.batch.currency) });
                    if (rarb.length > 0) {
                        $scope.raz.myrate = rarb[0].rate * $scope.pinrate;
                        $scope.raz.reverse = false;
                        $scope.raz.currency = $rootScope.mypriwal.currency;
                    } else {
                        //try it through USD
                        console.log('TRYING THROUGH USD')
                        var FromUSD = $scope.rates.filter(function (e) { return ( (e.destination == $rootScope.mypriwal.currency) && e.source == 'USD') });
                        var ToUSD = $scope.rates.filter(function (e) { return ( (e.destination == $scope.batch.currency) && e.source == 'USD') });
                       
                        var s1 = $scope.pinrate * parseFloat(FromUSD[0].rate);
                        var s2 = s1 / parseFloat(ToUSD[0].rate);
                        $scope.raz.myrate = s2.toFixed(4);
                        $scope.raz.reverse = false;
                        $scope.raz.currency = $rootScope.mypriwal.currency;
                    }

                }
            }
            })
    }
        $scope.updateCurrencies = function ()  {
            $scope.updatePinRate()


        }
$scope.updateOperList = function () {
    var country = $scope.batch.iso;
    if (country == 'ALL') {
        $scope.AclOperators = []
        $scope.canSelectOper = true;
    } else {
        api.getOperators(country)
                .then(function (op) {
                    $scope.AclOperators = op;
                    $scope.canSelectOper = true;
                })
    }
   
}
$scope.showD = function () {
    $scope.showDem = true;
}
                $scope.importPins = function () {
            var mydate = new Date()
            mydate.setFullYear(mydate.getFullYear() + 1);
            $scope.batch = {
                name : '',
                description : ''
            };
            $scope.availcur = [];
            $scope.myCur = [];
            $scope.impCount= 0;
            $rootScope.mywallets.forEach(function (w) {
                $scope.myCur.push(w.currency);
            })
            api.getCountries()
                .then(function (c) {
                    $scope.AclCountries = c;
                    return 
                })
                .then(function () {
                     $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-import-epbatch.html',
      controller : 'EpinBatchModalController',
      scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateBatchList();
           $rootScope.updateBalance()
          SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "You have imported " + selectedItem + " ePINS !",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            
                                        }
                                        
                                    });
       });
    }, function (err) {
      if ('undefined' !== typeof err) {
          console.log('err', err);
           $scope.emsg = err.data.status + ' - ' + err.data.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
      }
    });
                })
        }
        $scope.buyPins = function () {
            var mydate = new Date()
            mydate.setFullYear(mydate.getFullYear() + 1);
            $scope.batch = {
                name : '',
                type : 'flexi',
                count : 0,
                value : 0,
                currency : 'USD',
                valid_from : new Date(),
                valid_to : mydate,
                description : ''
            };
            $scope.availcur = [];
            $scope.myCur = [];
            $rootScope.mywallets.forEach(function (w) {
                $scope.myCur.push(w.currency);
            })
            if ($scope.profile.account_type == 'agent') {
                $scope.batch.allocated_to = $scope.profile.main_account
            } 
            api.getCurrencies()
                .then(function (c) {
                    $scope.currencies = [];
                   c.forEach(function (ca) {
                        $scope.currencies[ca.symbol] = ca.name;
                   })
                    return api.getRates();
                })
                .then(function (r) {
                    $scope.rates = r;
                    r.forEach(function (a) {
                        if (!$scope.availcur.contains(a.destination)) {
                            $scope.availcur.push(a.destination);
                        }
                    })
                    if ($scope.profile.account_type !== 'agent') {
                        return api.getAccounts();
                    } else {
                        return true;
                    }
                })
                .then(function (acc) {
                    if ($scope.profile.account_type !== 'agent') {
                        $scope.accounts = acc;
                        $scope.account_names = []
                        acc.accounts.forEach(function (a) {
                            $scope.account_names[a._id] = a.account_name;
                        })
                        return api.getAccount($scope.profile.main_account);
                    } else {
                        return true;
                    }
                })           
                .then(function (myacc) {
                    if ($scope.profile.account_type !== 'agent') {
                        $scope.accounts.accounts.push(myacc);
                        $scope.account_names[myacc._id] = 'Me'
                        return true;
                    } else {
                        return true;
                    }
                })
                .then(function () {
                    $scope.updateCurrencies()
                     $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-buy-batch.html',
      controller : 'PinBatchModalController',
      scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateBatchList();
           $rootScope.updateBalance()
          SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "You have bought " + $scope.batch.count + " x " + $scope.batch.value + " " + $scope.batch.currency + " PINS !",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            
                                        }
                                        
                                    });
       });
    }, function (err) {
      if ('undefined' !== typeof err) {
          console.log('err', err);
           $scope.emsg = err.data.status + ' - ' + err.data.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
      }
    });
                })
        }
      } else {
          $location.path('/login');
      }
    
  }]);

 angular.module('billinguiApp')
    .controller('EpinBatchModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', 'ngProgressFactory', function($uibModalInstance, $scope, api, $stateParams, Upload, ngProgressFactory) {
        $scope.createBatchOK = function () {
            api.createBatch($scope.batch)
                .then(function (re) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
      $scope.buyPinsOK = function () {
          var o = {};
          o.batches = [];
          o.batches.push($scope.batch)
          $scope.progressbar = ngProgressFactory.createInstance();
       $scope.progressbar.start();
          api.buyPins(o)
            .then(function (a) {
                $uibModalInstance.close();
                $scope.progressbar.complete();
            })
            .catch(function (err) {
                $scope.progressbar.complete();
                $uibModalInstance.dismiss(err);
            })
      }
      $scope.importPinsOK = function () {
           $scope.progressbar = ngProgressFactory.createInstance();
       $scope.progressbar.start();
          Upload.upload({
              url : '/api/accounts/me/epins/import',
              data : $scope.batch,
              headers: {'Authorization': 'Bearer ' + $scope.profile.token}
          })
          .then(function (d) {
              //console.log('RESP', d)
              $scope.impCount = d.data.count;
                $uibModalInstance.close(d.data.count);
                $scope.progressbar.complete();
          })
          .catch(function (err) {
                $scope.progressbar.complete();
                $uibModalInstance.dismiss(err);
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