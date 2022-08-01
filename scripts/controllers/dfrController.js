//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
.controller('DFRController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory) {
    if (api.isAuthed()) {

        $scope.progressbar = ngProgressFactory.createInstance();
        console.log($scope.progressbar);
        $scope.progressbar.start();
        var resizePageContent = function() {
            var page            = $('#page-container');
            var pageContent     = $('#page-content');
            var header          = $('header');
            var footer          = $('#page-content + footer');
            var sidebar         = $('#sidebar');
            var sidebarAlt      = $('#sidebar-alt');
            var sScroll         = $('.sidebar-scroll');

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
        var updateView = function () {
            api.getProfile()
            .then(function (prof) {
                $scope.profile = prof;

                return api._get('/drules');
            })
            .then(function (pr) {
                $scope.drules = pr.rulesets;
                return api._get('/frules');
            })
            .then(function (x) {
                $scope.frules = x.rulesets;
                $scope.load();
            })
        }

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

        $scope.newDRule = function () {
            $scope.rec = {};
            $scope.rec.rules = [];
            $scope.rec.isSystemWide = true;
            $scope.nrule = {};

            $scope.modal = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/partials/modal-new-drule.html',
                controller : 'DFRModalController',
                scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
            $timeout(function () {
                updateView();
            });
            }, function () {
                console.log('but i waz dizmizeddd')
            });
        }
        $scope.newFRule = function () {
            $scope.rec = {};
            $scope.rec.rules = [];
            $scope.rec.isSystemWide = true;
            $scope.nrule = {};

            $scope.modal = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/partials/modal-new-frule.html',
                controller : 'DFRModalController',
                scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
                $timeout(function () {
                    updateView();
                });
            }, function () {
                console.log('but i waz dizmizeddd')
            });
        }
        var updateCredentialView = function () {
            api.getProfile()
                .then(function (prof) {
                    $scope.profile = prof;

                    return api._get('/commlinks');
                })
                .then(function (pr) {
                    $scope.links = pr.links;
                    $scope.load();
                })
        }


        $scope.drEdit = function (id) {
            $scope.recid = id;
            api._get('/drules/' + id)
                .then(function (u) {
                    $scope.rec = u;
                
                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-edit-drule.html',
                        controller : 'DFRModalController',
                        scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                        $timeout(function () {
                            updateView();
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
        
        }

        $scope.drDelete = function (id) {
            $scope.recid = id;
            api._get('/drules/' + id)
                .then(function (u) {
                    $scope.rec = u;

                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-delete-drule.html',
                        controller : 'DFRModalController',
                        scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                        $timeout(function () {
                            updateView();
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
        }

        $scope.frEdit = function (id) {
            $scope.recid = id;
            api._get('/frules/' + id)
                .then(function (u) {
                    $scope.rec = u;

                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-edit-frule.html',
                        controller : 'DFRModalController',
                        scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                        $timeout(function () {
                            updateView();
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
        }

        $scope.frDelete = function (id) {
            $scope.recid = id;
            api._get('/frules/' + id)
                .then(function (u) {
                    $scope.rec = u;

                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-delete-frule.html',
                        controller : 'DFRModalController',
                        scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                        $timeout(function () {
                            updateView();
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
        }

        updateView();

    } else {
        $location.path('/login');
    }
    
}]);
angular.module('billinguiApp')
.controller('DFRModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
    $scope.createDROK = function () {
        $scope.rec.active = !!$scope.rec.active;
        api._post('/drules', $scope.rec)
            .then(function (re) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss();
            })
    }
    $scope.drEditOK = function () {
        
        api._put('/drules/' + $scope.recid, $scope.rec)
            .then(function (re) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss();
            })
    }

    $scope.drDeleteOK = function () {
        api._delete('/drules/' + $scope.recid)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss();
            })
    }

    $scope.createFROK = function () {
        $scope.rec.active = !!$scope.rec.active;
        api._post('/frules', $scope.rec)
            .then(function (re) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss();
            })
    }
    
    $scope.frEditOK = function () {}
    $scope.frDeleteOK = function () {
        api._delete('/frules/' + $scope.recid)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss();
            })
    }

    $scope.addRule = function () {
        $scope.nrule.active = !!$scope.nrule.active;
        $scope.rec.rules.push($scope.nrule);
        $scope.nrule = {};
    }
    $scope.removeRule = function (rule) {
        $scope.nru = [];
        $scope.rec.rules.forEach(function (x) {
            if (x.tag == rule.tag) {
            
            } else {
                $scope.nru.push(x);
            }
        })
        $scope.rec.rules = $scope.nru;
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
  