'use strict';

/**
 * @ngdoc overview
 * @name billinguiApp
 * @description
 * # billinguiApp
 *
 * Main module of the application.
 */
angular
  .module('billinguiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.tree',
    'ui.select',
    'ui.select.pagination',
    'paclient',
    'pascalprecht.translate',
    'ngFileUpload',
    'ui.bootstrap',
    'ngCsv',
    'chart.js',
    'colorpicker.module',
    'autocomplete',
    'ngProgress',
    'oitozero.ngSweetAlert',
    'angular-timezone-selector',
    //'angularjs-gauge',
    'LocalStorageModule'
  ])
  .config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: 'data/locale-',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //$translateProvider.useSanitizeValueStrategy('sanitize');
  }])
  // .config(['ngGaugeProvider', function (ngGaugeProvider) {
  //   ngGaugeProvider.setOptions({
  //     size: 250,
  //     cap: 'round',
  //     thick: 15,
  //     foregroundColor: "#ff8645",   // note the camelCase notation for parameter name
  //     backgroundColor: "#e4e4e4"
  // });
  // }])
  .constant('DashboardConfig', {
    'default': {
      'topFilter': 'All'
    }
  })
  .config(function ($stateProvider, $urlRouterProvider, ChartJsProvider) {
    ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
    $urlRouterProvider.otherwise('/');

    $stateProvider
    .state('app', {
      url: '/',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/main.html',
          controller: 'DashboardCtrl'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('accountList', {
      url: '/accounts/:filter',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accounts.html',
          controller: 'AccountsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newAccount', {
      url: '/account/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accountNew.html',
          controller: 'NewAccountController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('accountView', {
      url: '/account/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/accountView.html',
          controller: 'AccountController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('pinSearch', {
      url: '/pins/pinsearch',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pinsearch.html',
          controller: 'PinSearchController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    }).state('sr', {
      url: '/system/salesreport',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/sr.html',
          controller: 'SrController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('sc', {
      url: '/system/summary',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/scc.html',
          controller: 'SccController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('dfr', {
      url: '/system/dfr',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/dfrlist.html',
          controller: 'DFRController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('ccontrol', {
      url: '/system/msisdncache',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/ccontrol.html',
          controller: 'MsisdnCacheController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('apool', {
      url: '/system/apools',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/apools.html',
          controller: 'AccountPoolController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('commLinks', {
      url: '/system/commlinks',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/commlinks.html',
          controller: 'CommLinkController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('pinBatchList', {
      url: '/pins/pins',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pinbatches.html',
          controller: 'PinBatchListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('providerList', {
      url: '/providers',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/providers.html',
          controller: 'ProviderController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('pTab', {
      url: '/system/price-tables',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pricetables.html',
          controller: 'PriceTableController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('batchView', {
      url: '/pins/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/pins.html',
          controller: 'PinListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('supportDash', {
      url: '/support/',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/supportdash.html',
          controller: 'SupportDashController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
	.state('ticketList', {
      url: '/tickets/',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/tickets.html',
          controller: 'TicketListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
 .state('ticketView', {
      url: '/tickets/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/ticketView.html',
          controller: 'TicketController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('tList', {
      url: '/topuplogs',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/topuplog.html',
          controller: 'TopupListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('ftList', {
      url: '/ftconsole',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/ftconsole.html',
          controller: 'FtconsoleController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('provMaps', {
      url: '/provmap',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/mapping.html',
          controller: 'MappingController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('transactionList', {
      url: '/transactions',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/transactions.html',
          controller: 'TransactionListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('transactionView', {
        url: '/transaction/:id/:transactions',
        views: {
            'sidebar': {
                templateUrl: 'views/partials/sidebar.html',
                controller: 'SidebarCtrl'
            },
            'content': {
                templateUrl: 'views/partials/transactionView.html',
                controller: 'TransactionController'
            },
            'header': {
                templateUrl: 'views/partials/header.html',
                controller: 'SidebarCtrl'
            },
            'modals': {
                templateUrl: 'views/partials/modals.html',
                controller: 'ModalCtrl'
            },
            'footerjs': {
                templateUrl: 'views/partials/footerjs_dashboard.html'
            }
        }
    })
    .state('loginList', {
      url: '/loginlogs',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/loginlogs.html',
          controller: 'LoginListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      .state('userList', {
      url: '/users',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/users.html',
          controller: 'UsersController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('rateList', {
      url: '/rates',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/rates.html',
          controller: 'RateListController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
     .state('credsList', {
      url: '/credentials',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/credentials.html',
          controller: 'CredentialsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
      .state('settingList', {
      url: '/settings',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/settings.html',
          controller: 'SettingController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('apiSettingList', {
      url: '/apisettings',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/apisettings.html',
          controller: 'ApiSettingsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newAgent', {
      url: '/account/:id/accounts/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/agentNew.html',
          controller: 'NewAgentController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('newItem', {
      url: '/account/:account/items/new',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/itemNew.html',
          controller: 'NewItemController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
        .state('supportPanelView', {
      url: '/support-logs/:id',
      views: {
        'sidebar': {
          templateUrl: 'views/partials/sidebar.html',
          controller: 'SidebarCtrl'
        },
        'content': {
          templateUrl: 'views/partials/supportPanel.html',
          controller: 'ItemsController'
        },
        'header': {
          templateUrl: 'views/partials/header.html',
          controller: 'SidebarCtrl'
        },
        'modals': {
          templateUrl: 'views/partials/modals.html',
          controller: 'ModalCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_dashboard.html'
        }
      }
    })
    .state('logout', {
      url : '/logout',
      views : {
        'login' : {
          templateUrl : 'views/partials/login.html',
          controller : 'LogoutController'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_login.html'
        }
      }
    })
    .state('login', {
      url: '/login',
      views: {
        'login' : {
          templateUrl: 'views/partials/login.html',
          controller : 'LoginCtrl'
        },
        'footerjs' : {
          templateUrl: 'views/partials/footerjs_login.html',
          controller : 'SidebarCtrl'
        }
      }
    });
  }).directive('datetimepickerNeutralTimezone', function() {
    return {
      restrict: 'A',
      priority: 1,
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        ctrl.$formatters.push(function (value) {
          var date = new Date(Date.parse(value));
          date = new Date(date.getTime() + (60000 * date.getTimezoneOffset()));
          return date;
        });

        ctrl.$parsers.push(function (value) {
          var date = new Date(value.getTime() - (60000 * value.getTimezoneOffset()));
          return date;
        });
      }
    };
  }).config(['$provide', function($provide) {
    $provide.decorator('localStorageService', function ($delegate) {
      
      //store original get & set methods
      var originalGet = $delegate.get,
        originalSet = $delegate.set;
  
      /**
       * extending the localStorageService get method
       *
       * @param key
       * @returns {*}
       */
      $delegate.get = function (key) {
        if(originalGet(key)) {
          var data = originalGet(key);
  
          if(data.expire) {
            var now = Date.now();
  
            // delete the key if it timed out
            if(data.expire < now) {
              $delegate.remove(key);
              return null;
            }
  
            return data.data;
          } else {
            return data;
          }
        } else {
          return null;
        }
      };
  
      /**
       * set
       * @param key               key
       * @param val               value to be stored
       * @param {int} expires     hours until the localStorage expires
       */
      $delegate.set = function (key, val, expires) {
        var expiryDate = null;
  
        if(angular.isNumber(expires)) {
          expiryDate = Date.now() + (1000 * 60 * 60 * expires);
          originalSet(key, {
            data: val,
            expire: expiryDate
          });
        } else {
          originalSet(key, val);
        }
      };
  
      return $delegate;
    });
  }]);
