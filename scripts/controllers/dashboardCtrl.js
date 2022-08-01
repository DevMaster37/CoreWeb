//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
.controller('DashboardCtrl', ['$scope', 'api','$location', 'ngProgressFactory','$interval','$uibModal','SweetAlert', '$rootScope', 'localStorageService', 'DashboardConfig',
function ($scope, api, $location, ngProgressFactory,$interval,$uibModal,SweetAlert, $rootScope, localStorageService, dashboardConfig) {
     
    $scope.progressbar = ngProgressFactory.createInstance();
    console.log($scope.progressbar);
    $scope.progressbar.start();

    if (!api.isAuthed()){
        $scope.progressbar.complete();
        $location.path('/login');
        return;
    }
    /////////////////////////////////////////
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
        var link = $("#home");
        var upSpeed     = 250;
        var downSpeed   = 250;
        link.addClass('open').next().slideDown(downSpeed);
        // Resize #page-content to fill empty space if exists
        setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
        $("#appdash").css('active');
        $scope.progressbar.complete();        
    }
    /*
    $rootScope.account_names = function () {
        if ($rootScope.anames == typeof 'undefined') {
            api._get('/accounts/names')
                .then(function (x) {
                    $rootScope.anames = [];
                    x.forEach(function (z) {
                        $rootScope.anames[z._id] = z.account_name;
                    })
                    return $rootScope.anames;
                })
        } else {
            return $rootScope.anames;
        }
    }
    */
    api.getProfile()
    .then(function (prof) {
        if (prof.account_type == 'user') {
            $location.path('/account/' + prof.main_account);
        }
        $scope.profile = prof;
        $scope.load();
        //   WidgetsStats.init();
        //return api.getAccounts()
        return false;
    })
    .then(function (acc) {
        $scope.accounts = {};
        $scope.account_names = localStorageService.get('acnames');
        //$rootScope.accounts = acc.accounts;
        // return api.getDashboard()
        return localStorageService.get('dashMain');
    })
    .then(function (d) {
        $scope.dash_data = d;
        $scope.providerStr = 'default';          
        $scope.topStr = dashboardConfig.default.topFilter;
        $scope.wallet = [];
        d.balances.forEach(function(line){
            if(!$scope.wallet.contains(line._id)){
                if(line._id !== null)
                    $scope.wallet.push(line._id);
            }
        });
        $scope.balance = [];
        $scope.wallet.forEach(function(line){
            var temp = {};
            temp.currency = line;
            temp.amount = 0;
            temp.count = 0;
            var agents = [];
            d.balances.forEach(function(val){
                if(line == val._id){
                    temp.amount += val.totalAmmount;
                    if(!agents.contains(val.account_name)){
                        agents.push(val.account_name);
                    }
                }
            });
            temp.count = agents.length;
            $scope.balance.push(temp);
        });
        $scope.countries = [];
        $scope.cdata = [];
        d.top5_countries_topup_amount.forEach(function (line) {
            $scope.countries.push(line['_id']);
            var la = line['amount'].toFixed(2);
            $scope.cdata.push(la)
        })
        $scope.cco_labels = []
        $scope.cco_data = []
        d.top5_countries_topup_count.forEach(function (line) {
            var lab;
            if (line['_id'] == null) {
                lab = 'No Country';
            } else {
                lab = line['_id'];
            }
            $scope.cco_labels.push(lab)
            $scope.cco_data.push(line['count']);
        })
        $scope.cca_labels = [];
        $scope.cca_data = [];
        d.top5_accounts_topup_amount.forEach(function (line) {
            console.log('lineId', line, line._id);
            if ('undefined' !== typeof $scope.account_names) {
                var la = $scope.account_names[line._id];
            }  else {
                var la = 'Unknown Account';
            }
            $scope.cca_labels.push(la);
            $scope.cca_data.push(line.amount.toFixed(2));
        })
        $scope.ccc_labels = [];
        $scope.ccc_data = [];
        d.top5_accounts_topup_count.forEach(function (line ) {
            if ('undefined' !== typeof $scope.account_names) {
                var la = $scope.account_names[line._id];
            } else {
                var la = 'Unknown Account';
            }
            $scope.ccc_labels.push(la);
            $scope.ccc_data.push(line.count);
        });
        $scope.coc_labels = [];
        $scope.coc_data = [];

        var top5;
        d.top5_operations_bycode.forEach(function (line) {
            var lab;
            if (line['_id'] == null) {
                lab = 'Unknown Code';
            } else {
                lab = line['_id'];
            }
            $scope.coc_labels.push(lab)
            $scope.coc_data.push(line.count);
            top5  += line.count;
        });
        if ( (d.total_operations_count - top5) > 0 ) {

            //we have other
            var res = d.total_operations_count - top5;
            $scope.coc_labels.push('Other');
            $scope.coc_data.push(res);
        }
    
        //return api.getProviders();
        var providers = localStorageService.get('providers');

        if(providers == null) {
            // Logout`
            $location.path('/logout');
        }

        return providers;
    })
    .then(function (prov) {
        $scope.providers = prov.providers;
        $scope.changeMode('daily');
        return localStorageService.get('currencies');
    })
    .then(function (cur) {
        $rootScope.currencies = [];
        cur.forEach(function (c) {
            $rootScope.currencies[c.symbol] = c.name;
        })
        return localStorageService.get('clist');
    })
    .then(function (c) {
        $rootScope.countries = c;
    })
    .catch(function (err) {
        console.log(err);
    });

    $scope.setDateSelectOptions = function(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var firstDay = new Date(yyyy, mm-1, 1).getDay();    
        var ww = Math.ceil((dd+firstDay)/7);
        $scope.year_sel = yyyy.toString();
        $scope.month_sel = mm.toString();
        $scope.week_sel = ww.toString();
        $scope.day_sel = dd.toString();
        $scope.selectedDate = $scope.year_sel+'-'+$scope.month_sel+'-'+$scope.week_sel+'-'+$scope.day_sel;
    }
    

    //<!--dragon added 2017_11_13 -->
    $scope.changeMode = function (mode) {
        function ModeBase($scope) {
            var that = this;
            this.updateListeners = [];
            this.prepare($scope).then(function() {
                if(that.isCustom){                    
                    $scope.calculateDashboardCoreByCustomTime();
                } else {
                    $scope.calculateDashboardCore();
                }
                startTimer();
            });

            this.destroy = function () {
                this.updateListeners.forEach(function(listener) {
                    listener.call();
                })
            }
        }

        function TodayMode($scope) {
            ModeBase.call(this, $scope);
        }

        TodayMode.prototype.prepare = function ($scope) {
            $scope.tex = "Today";
            return Promise.resolve(true);
        }

        function DailyMode($scope) {
            ModeBase.call(this, $scope);
        }
        DailyMode.prototype.prepare = function($scope) {
            $scope.tex = "Past 24 hours";
            this.updateListeners.push(
                $rootScope.$on('update_core_dash_daily', function (event, obj) {
                    console.log('Update Daily');
                    $scope.calculateDashboardCore();
                })
            );
            return Promise.resolve(true);
        }

        function ThisWeekMode($scope) {
            ModeBase.call(this, $scope);
        }
        ThisWeekMode.prototype.prepare = function ($scope) {
            $scope.tex = "This Week";
            return Promise.resolve(true);
        }

        function WeeklyMode($scope) {
            ModeBase.call(this, $scope);
        }
        WeeklyMode.prototype.prepare = function($scope) {
            $scope.tex = "Past 7 days";
            return Promise.resolve(true);
        }

        function ThisMonthMode($scope) {
            ModeBase.call(this, $scope);
        }
        ThisMonthMode.prototype.prepare = function($scope) {
            $scope.tex = "This Month";
            return Promise.resolve(true);
        }

        function MonthlyMode($scope) {
            ModeBase.call(this, $scope);
        }
        MonthlyMode.prototype.prepare = function($scope) {
            $scope.tex = "Past 30 days";
            return Promise.resolve(true);
        }

        function ThisYearMode($scope) {
            ModeBase.call(this, $scope);
        }
        ThisYearMode.prototype.prepare = function($scope) {
            $scope.tex = "This Year";
            return Promise.resolve(true);
        }
        function YearlyMode($scope) {
            ModeBase.call(this, $scope);
        }
        YearlyMode.prototype.prepare = function($scope) {
            $scope.tex = "Past 12 months";
            return Promise.resolve(true);
        }

        function CustomDayMode($scope) {
            ModeBase.call(this, $scope);
        }
        CustomDayMode.prototype.prepare = function($scope) {
            var that = this;

            return new Promise(function(resolve, reject) {
                $scope.selectNum = 0;
                $scope.sel_date = "Day";
                $scope.setDateSelectOptions();
                $scope.yearlist = [];
                for(var i = 2017;i<=$scope.year_sel;i++){
                    $scope.yearlist[i-2017] = i.toString();
                }
                $scope.monthlist = ['1','2','3','4','5','6','7','8','9','10','11','12'];
                $scope.weeklist = [];
                $scope.daylist = [];
                days_of_month = new Date($scope.year_sel, $scope.month_sel, 0).getDate();
                for(var i = 0;i<days_of_month;i++){
                    $scope.daylist[i] = (i+1).toString();
                }
                
                showDateSelectModal().then(function(result) {
                    if(!result) {
                        return
                    }

                    $scope.selectedDate = result;
                    var strlist = result.split("-");
                    that.isCustom = true;
                    if(strlist[0]==$scope.year_sel && strlist[1]==$scope.month_sel && strlist[3]==$scope.day_sel){
                        that.isCustom = false;
                        $scope.mode = 'today';
                        $scope.tex = 'Today';
                    }
                    resolve();
                })
            })
            
        }

        function CustomWeekMode($scope) {ModeBase.call(this, $scope);}
        CustomWeekMode.prototype.prepare = function($scope) {
            var that = this;

            return new Promise(function(resolve, reject) {
                $scope.selectNum = 1;
                $scope.sel_date = "Week";
                $scope.setDateSelectOptions();
                $scope.yearlist = [];
                for(var i = 2017;i<=$scope.year_sel;i++){
                    $scope.yearlist[i-2017] = i.toString();
                }
                $scope.monthlist = ['1','2','3','4','5','6','7','8','9','10','11','12'];
                $scope.weeklist = ['1','2','3','4','5'];
                $scope.daylist = [];
                showDateSelectModal().then(function(result) {
                    if(!result) {
                        return
                    }
                    that.isCustom = true;
    
                    $scope.selectedDate = result;
                    var strlist = result.split("-");
                    
                    if(strlist[0]==$scope.year_sel && strlist[1]==$scope.month_sel && strlist[2]==$scope.week_sel){
                        that.isCustom = false;
                        $scope.mode = 'this_week';
                        $scope.tex = 'This Week';
                    }
                    resolve();
                })
            });
        }

        function CustomMonthMode($scope) {ModeBase.call(this, $scope);}
        CustomMonthMode.prototype.prepare = function($scope) {
            var that = this;

            return new Promise(function(resolve, reject) {
                $scope.selectNum = 2;
                $scope.sel_date = "Month";
                $scope.setDateSelectOptions();
                $scope.yearlist = [];
                for(var i = 2017;i<=$scope.year_sel;i++){
                    $scope.yearlist[i-2017] = i.toString();
                }
                $scope.monthlist = ['1','2','3','4','5','6','7','8','9','10','11','12'];
                $scope.weeklist = [];
                $scope.daylist = [];
                showDateSelectModal().then(function(result) {
                    if(!result) {
                        return
                    }
                    
                    that.isCustom = true;
                    $scope.selectedDate = result;
                    var strlist = result.split("-");
                    if(strlist[0]==$scope.year_sel && strlist[1]==$scope.month_sel){
                        that.isCustom = false;
                        $scope.mode = 'this_month';
                        $scope.tex = 'This Month';
                    }
                    resolve();
                })
            });
        }

        function CustomYearMode($scope) {ModeBase.call(this, $scope);}
        CustomYearMode.prototype.prepare = function($scope) {
            var that = this;

            return new Promise(function(resolve, reject) {
                $scope.selectNum = 3;
                $scope.sel_date = "Year";
                $scope.setDateSelectOptions();
                $scope.yearlist = [];
                for(var i = 2017;i<=$scope.year_sel;i++){
                    $scope.yearlist[i-2017] = i.toString();
                }
                $scope.monthlist = [];
                $scope.weeklist = [];
                $scope.daylist = [];
                showDateSelectModal().then(function(result) {
                    if(!result) {
                        return
                    }

                    $scope.selectedDate = result;
                    var strlist = result.split("-");
                    that.isCustom = true;
                    if(strlist[0]==$scope.year_sel){
                        that.isCustom = false;
                        $scope.mode = 'this_year';
                        $scope.tex = 'This Year';
                    }
                    resolve();
                })
            });
        }

        function showDateSelectModal() {
            var modal = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/partials/modal-select-date.html',
                controller: 'DateSelectController',
                scope: $scope
            });

            return modal.result.catch(function () {
                console.log("cancel")
            });
        }
        var modeList = {
            'today': TodayMode,
            'daily': DailyMode,
            'this_week': ThisWeekMode,
            'weekly': WeeklyMode,
            'this_month': ThisMonthMode,
            'monthly': MonthlyMode,
            'this_year': ThisYearMode,
            'yearly': YearlyMode,
            'custom_day': CustomDayMode,
            'custom_week': CustomWeekMode,
            'custom_month': CustomMonthMode,
            'custom_year': CustomYearMode
        }

        // Destroy previous mode object
        if($scope.modeObj) {
            $scope.modeObj.destroy();
        }

        $scope.mode = mode;
        if(modeList[mode]) {
            $scope.modeObj = new modeList[mode]($scope);
        }
    };

    $scope.calculateDashboardCoreByCustomTime = function(){
        api.getCoreDashboardByCustomTime($scope.mode,$scope.selectedDate)
        .then(function(d){
            if(d==null){
                SweetAlert.swal("Oops!", "No data was found", "error");
                return;
            }
            strlist = $scope.selectedDate.split("-");
            switch($scope.mode){
                case 'custom_day':
                    $scope.tex =strlist[0]+'-'+strlist[1]+'-'+strlist[3]+'(Custom Day)';
                    break;
                case 'custom_week':
                    $scope.tex =strlist[0]+'-'+strlist[1]+'-'+strlist[2]+'(Custom Week)';
                    break;
                case 'custom_month':
                    $scope.tex =strlist[0]+'-'+strlist[1]+'(Custom Month)';
                    break;
                case 'custom_year':
                    $scope.tex =strlist[0]+'(Custom Year)';
                    break;
            }
            $scope.db = d;//Dragon Added 2017.11.13 for keeping DB
            $scope.providerStr = 'default';
            $scope.TopList = ['All','Top5','Top10'];
            $scope.showtransflag = 'default';
            $scope.config = {
                autoHideScrollbar: false,
                theme: 'light',
                advanced:{
                    updateOnContentResize: true
                },
                setHeight: 350,
                scrollInertia: 0
            }
            $scope.showDashboard(d,dashboardConfig.default.topFilter);
        });
    }

    $scope.calculateDashboardCore = function(){
        var mykey = 'dashcore_' + $scope.mode;
        var cachedDashboard = localStorageService.get(mykey);
        if (cachedDashboard) {
            var d = cachedDashboard;
            $scope.db = d;//Dragon Added 2017.11.13 for keeping DB
            $scope.providerStr = 'default';       
            $scope.TopList = ['All','Top5','Top10'];
            $scope.showtransflag = 'default';
            $scope.config = {
                autoHideScrollbar: false,
                theme: 'light',
                advanced:{
                    updateOnContentResize: true
                },
                setHeight: 350,
                scrollInertia: 0
            }
            
            $scope.showDashboard(d,dashboardConfig.default.topFilter);
        } else {
            api.getCoreDashboard($scope.mode)
            .then(function (d) {
                if(d==null)
                    return;
                $scope.db = d;//Dragon Added 2017.11.13 for keeping DB
                $scope.providerStr = 'default';
                $scope.TopList = ['All','Top5','Top10'];
                $scope.showtransflag = 'default';
                $scope.config = {
                    autoHideScrollbar: false,
                    theme: 'light',
                    advanced:{
                        updateOnContentResize: true
                    },
                    setHeight: 350,
                    scrollInertia: 0
                }
                
                $scope.showDashboard(d,dashboardConfig.default.topFilter);
            });
        }
        
    }

    $scope.changedProductType = function (type) {
        $scope.showtransflag = 'producttype';
        $scope.productType = type;
        $scope.showDashboard($scope.db, $scope.topStr);
    }

    $scope.changedProvider = function(str){
        $scope.showtransflag = 'provider';
        $scope.providerStr = str;
        $scope.showDashboard($scope.db,$scope.topStr);
    }
    
    $scope.changedCountry = function(str){
        $scope.providerStr = 'default';
        $scope.countryStr = str;
        $scope.showtransflag = 'country';
        $scope.showDashboard($scope.db,$scope.topStr);
    }

    $scope.changedDestination = function(str){
        $scope.providerStr = 'default';
        $scope.destStr = str;
        $scope.showtransflag = 'destination';
        $scope.showDashboard($scope.db,$scope.topStr);
    }

    $scope.changedAgent = function(agentID){
        $scope.providerStr = 'default';
        $scope.agentID = agentID;
        $scope.showtransflag = 'agent';
        $scope.db.top10_accounts.forEach(function(val){
            if(val._id === agentID){
                api.getAccount(val._id)
                .then(function(acc){
                    if (acc !== null) {
                        acc.wallets.forEach(function (w) {
                            if (w.primary === true) {
                                $scope.agentCur = w.currency;
                                $scope.showDashboard($scope.db,$scope.topStr);
                            }
                        })
                    } else {
                        console.log('acc is null')
                    }
                    
                })
            }
        });
    }

    //for count in Total Amount of money in the system
    $scope.changeTransCount = function(){
        $scope.TransCountByCur = {};
        $scope.wallet.forEach(function(line){
            $scope.TransCountByCur[line] = 0;
            if($scope.db.transCount_by_currency!==undefined){
                $scope.db.transCount_by_currency.forEach(function(val){
                    if(line == val._id){
                        $scope.TransCountByCur[line] = val.count;
                    }
                });
            }
        });
        console.log($scope.topStr, $scope.balance, $scope.TransCountByCur);
    }

    $scope.changedTopCount = function(topCnt){
        $scope.showtransflag = 'default';
        $scope.providerStr = 'default';
        $scope.topStr = topCnt;
        $scope.showDashboard($scope.db,topCnt);
    }

    $scope.changedCurrency = function (flag) {
        $scope.providerStr = 'default';
        $scope.currency = flag;
        // $scope.showDashboard($scope.db,topCnt);
    };

    function TopupModel(props) {
        Object.assign(this, {
            suc_count: 0,
            fail_count: 0,
            tot_count: 0,
            suc_amount: 0,
            fail_amount: 0,
            tot_amount: 0
        }, props);
    }

    $scope.topDestinations = function(d){
        $scope.destinationList = [];
        if(d.top10_destinations !== undefined){
            d.top10_destinations.forEach(function (e){
                var na = e._id.country + '-' + e._id.operator;
                if(!$scope.destinationList.contains(na)){
                    $scope.destinationList.push(na);
                }
            });
        }
    }

    $scope.topCountries = function(d){
        $scope.countryList = [];
        if(d.top10_countries !== undefined){
            d.top10_countries.forEach(function (e){
                if(!$scope.countryList.contains(e._id)){
                    $scope.countryList.push(e._id);
                }
            });
        }
    }

    $scope.topAccounts = function(d){
        $scope.accountList = d.top10_accounts;
        var accountIDs = $scope.accountList.map(function (account) { return account._id });

        $scope.accountWallets = {};
        api.getAccountsWallet(accountIDs)
        .then(function(accs){
            accs.forEach(function(account) {
                $scope.accountWallets[account['_id']] = account['wallets'];
            });
        })
    }

    $scope.changeTCTable = function(d,topCnt){

        function totalTopupInCountry(stats, statFilter, country) {
            var topupInCurrency = {};
            stats.forEach(function (stat) {
                statFilter.filter(stat).forEach(function(val) {
                    if(val.country != country) {
                        return;
                    }

                    if(!topupInCurrency[val.currency]) {
                        topupInCurrency[val.currency] = new TopupModel({country: country});
                    }
                    var totalTopup = topupInCurrency[val.currency];

                    if(val.code === 'RECHARGE_COMPLETE'){
                        totalTopup.suc_count += val.count;
                        totalTopup.suc_amount += val.amount;
                    } else {
                        totalTopup.fail_count += val.count;
                        totalTopup.fail_amount += val.amount;
                    }
                    totalTopup.cur = val.currency;
                    totalTopup.tot_count += val.count;
                    totalTopup.tot_amount += val.amount;
                });    
            })
            return Object.values(topupInCurrency);
        }

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryTopupTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        }

        var countryList = $scope.countryList;
        if(showflag === 'destination') {
            countryList = [$scope.destStr.split('-')[0]];
        } else if(showflag === 'country') {
            countryList = [$scope.countryStr];
        }
        
        $scope.topupCountry = [];
        countryList.forEach(function (country) {
            var topups = totalTopupInCountry(d.stats, filterObj, country);

            $scope.topupCountry = $scope.topupCountry.concat(topups);
        })
    }

    $scope.changeTDATable = function(d,topCnt){
        function totalTopupInDestination(stats, statFilter, destination) {
            var topupInCurrency = {};

            stats.forEach(function (stat) {
                statFilter.filter(stat).forEach(function(val) {
                    if((val.country + '-' + val.operator_name) !== destination) {
                        return;
                    }

                    if(!topupInCurrency[val.currency]) {
                        topupInCurrency[val.currency] = new TopupModel({destination: destination});
                    }
                    var totalTopup = topupInCurrency[val.currency];

                    if(val.code === 'RECHARGE_COMPLETE'){
                        totalTopup.suc_count += val.count;
                        totalTopup.suc_amount += val.amount;
                    } else {
                        totalTopup.fail_count += val.count;
                        totalTopup.fail_amount += val.amount;
                    }
                    totalTopup.cur = val.currency;
                    totalTopup.tot_count += val.count;
                    totalTopup.tot_amount += val.amount;
                });    
            })
            return Object.values(topupInCurrency);
        }

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryTopupTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        }

        var destinationList = $scope.destinationList;
        if(showflag == 'country') {
            destinationList.filter(function(destination) {return destination.split('-')[0] === $scope.countryStr})
        } else if(showflag == 'destination') {
            destinationList = [$scope.destStr];
        }

        $scope.topupDestination_by_Amount = [];
        destinationList.forEach(function (destination) {
            var topups = totalTopupInDestination(d.stats, filterObj, destination);
            $scope.topupDestination_by_Amount = $scope.topupDestination_by_Amount.concat(topups);
        });
    }
    

    $scope.changeTurnoverTable = function(d,topCnt){
        var showflag = $scope.showtransflag;
        var filterObj;
        var accounts = d.top10_accounts;
        if(showflag === 'default'){
            if(topCnt == 'Top5') {
                accounts = accounts.slice(0, 5);
                accountIDs = accounts.map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accounts = accounts.slice(0, 10);
                accountIDs = accounts.map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new AccountPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new AccountPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new AccountPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.productType);
        }

        var paidAccounts = {};
        d.stats.forEach(function (entry){
            filterObj.filter(entry).forEach(function (val) {
                if(!paidAccounts[val._id]) {
                    paidAccounts[val._id] = {
                        _id: val._id,
                        account_name: val.account_name,
                        parent: '',
                        suc_count: 0,
                        fail_count: 0,
                        tot_count: 0,
                        suc_amount: 0,
                        fail_amount: 0,
                        tot_amount: 0
                    };
                }
                
                topupObj = paidAccounts[val._id];
                if(val.code === 'RECHARGE_COMPLETE'){
                    topupObj.suc_count += val.count;
                    topupObj.suc_amount += val.amount;
                } else {
                    topupObj.fail_count += val.count;
                    topupObj.fail_amount += val.amount;
                }
                topupObj.parent = val.parentname;
                topupObj.cur = val.currency;
                topupObj.tot_count += val.count;
                topupObj.tot_amount += val.amount;
            });
        });

        $scope.paidAccounts = Object.values(paidAccounts).sort(function (valA, valB) {
            return valB.tot_count - valA.tot_count;
        });
    }

    $scope.changeTCPTable = function(d,topCnt){
        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.productType);
        }
        
        $scope.tcpItems = [];
        d.stats.forEach(function (entry){
            filterObj.filter(entry).forEach(function (val) {
                var tempObj = {};
                tempObj.count = 0;
                tempObj.amount = 0;
                var flg = false;
                if(val.code === 'RECHARGE_COMPLETE'){
                    $scope.tcpItems.some(function (item) {                            
                        if(item.currency === val.currency && item.operator === val.operator_name && item.country === val.country && item.tag === val.tag){
                            flg = true;
                            item.count += val.count;
                            item.amount += val.amount;
                            return true;
                        }
                    })

                    if(!flg){
                        tempObj.currency = val.currency;
                        tempObj.operator = val.operator_name;
                        tempObj.country = val.country;
                        tempObj.tag = val.tag;
                        tempObj.count = val.count;
                        tempObj.amount = val.amount;
                        $scope.tcpItems.push(tempObj);  
                    }
                }
            });
        });

        $scope.tcpCount = $scope.tcpItems.length;
    }

    $scope.changeTCPGraph = function(d,topCnt){
        $scope.tcpg = {};
        $scope.tcpg.labels = [];
        $scope.tcpg.series = [];
        $scope.tcpg.data = [];
        $scope.tcpg.options = {legend: {display:true}};

        d.stats.forEach(function (entry){
            $scope.tcpg.labels.push($scope.formatTime(entry.ts, $scope.mode));
        })

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryTopupTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        }

        var providerList = $scope.providerList;
        if($scope.showtransflag === 'provider') {
            providerList = [$scope.providerStr];
        }

        providerList.forEach(function (provider, index) {
            $scope.tcpg.data[index] = [];
            $scope.tcpg.series[index] = provider;

            d.stats.forEach(function (entry){
                var topupCount = 0;
                filterObj.filter(entry).forEach(function(val){
                    if(val.tag === provider){
                        if(val.code === 'RECHARGE_COMPLETE'){
                            topupCount += val.count;
                        }
                    }
                })
                $scope.tcpg.data[index].push(topupCount);                
            })
        });
    }

    $scope.changeTransByAll = function(db,topCnt,showflag){
        $scope.ov = {};
        $scope.ov.suc = {};
        $scope.ov.fail = {};
        $scope.ov.suc.amount = {};
        $scope.ov.suc.count = {};
        $scope.ov.suc.perc = {};
        $scope.ov.fail.amount = {};
        $scope.ov.fail.count = {};
        $scope.ov.fail.perc = {};

        $scope.balances2.forEach(function(cur) {
            $scope.ov.suc.amount[cur] = 0;
            $scope.ov.suc.count[cur] = 0;
            $scope.ov.suc.perc[cur] = 0;
            $scope.ov.fail.amount[cur] = 0;
            $scope.ov.fail.count[cur] = 0;
            $scope.ov.fail.perc[cur] = 0;
        });
        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = db.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.productType);
        }
        

        db.stats.forEach(function(element){
            filterObj.filter(element).forEach(function (e) {
                if(e.code === 'RECHARGE_COMPLETE'){
                    $scope.ov.suc.amount[e.currency] += e.amount;
                    $scope.ov.suc.count[e.currency] += e.count;
                } else {
                    $scope.ov.fail.amount[e.currency] += e.amount;
                    $scope.ov.fail.count[e.currency] += e.count;
                }
            });
        });

        $scope.balances2.forEach(function (cur) {
            var tot = $scope.ov.suc.count[cur] + $scope.ov.fail.count[cur];
            if(tot > 0) {
                $scope.ov.suc.perc[cur] = (($scope.ov.suc.count[cur] / tot) * 100).toFixed(2);
                $scope.ov.fail.perc[cur] = (($scope.ov.fail.count[cur] / tot) * 100).toFixed(2);
            }
        });
    }

    $scope.getProviderList = function(d){
        $scope.providerList = [];
        d.stats.forEach(function (entry){
            if(entry.top10_countries_paid!==undefined){
                entry.top10_countries_paid.forEach(function (val){
                    if(!$scope.providerList.contains(val.tag)){
                        if(val.tag !== null && val.tag!==undefined){
                            $scope.providerList.push(val.tag);                                
                        }
                    }
                });
            }
            if(entry.top10_accounts_paid!==undefined){
                entry.top10_accounts_paid.forEach(function (val){
                    if(!$scope.providerList.contains(val.tag)){
                        if(val.tag !== null && val.tag!==undefined){
                            $scope.providerList.push(val.tag);
                        }
                    }
                });
            }
        });
    }
    
    $scope.getProductTypes = function (d) {
        this.productTypes = ProductType.TYPE_STRINGS;
    }

    $scope.getBalances = function(d){
        $scope.balances2 = [];
        $scope.curTurnoverList = [];
        
        $scope.curTurnoverList = [];
        d.stats.forEach(function (entry){
            if(entry.top10_accounts_paid!==undefined){
                entry.top10_accounts_paid.forEach(function (val){
                    index = -1;
                    for(var i=0;i<$scope.curTurnoverList.length;i++){
                        var temp = $scope.curTurnoverList[i];
                        if(temp.cur == val.currency){
                            index = i;
                            break;
                        }
                    }
                    if(index!=-1){
                        var temp = $scope.curTurnoverList[index];
                        temp.count+=val.count;
                        temp.amount+=val.amount;
                    } else {
                        var temp ={};
                        temp.cur = val.currency;
                        temp.count = val.count;
                        temp.amount = val.amount;
                        $scope.curTurnoverList.push(temp);
                    }
                })
            }
        });


        var l = $scope.curTurnoverList.length;
        for(var i=0;i<l-1;i++){
            for(var j=i+1;j<l;j++){
                if($scope.curTurnoverList[i].count<$scope.curTurnoverList[j].count){
                    var temp = $scope.curTurnoverList[i];
                    $scope.curTurnoverList[i] = $scope.curTurnoverList[j];
                    $scope.curTurnoverList[j] = temp;
                }
            }
        }
        for(var i=0;i<l;i++){
            $scope.balances2.push($scope.curTurnoverList[i].cur);
        }
        $scope.currency = $scope.balances2[0];
    }

    $scope.changeCTCTable = function(d,topCnt){
        $scope.ctc = {};
        $scope.ctc.labels = [];
        $scope.ctc.series = [];
        $scope.ctc.data = [];
        $scope.ctc.options = {legend: {display:true}};
        
        if(d==null)
            return;

        d.stats.forEach(function (entry){
            $scope.ctc.labels.push($scope.formatTime(entry.ts, $scope.mode));
        });
    
        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryTopupTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        }

        var countryList = $scope.countryList;
        if(showflag === 'country') {
            countryList = [$scope.countryStr];
        } else if(showflag === 'destination') {
            var cn = $scope.destStr.split('-');
            countryList = [cn[0]];
        }

        countryList.forEach(function(country, i) {
            $scope.ctc.series.push(country);
            $scope.ctc.data[i] = [];

            d.stats.forEach(function (entry){
                var topupCount = 0;
                filterObj.filter(entry).forEach(function (val) {                    
                    if(val.country === country && val.code === 'RECHARGE_COMPLETE'){
                        topupCount += val.count;
                    }
                });
                $scope.ctc.data[i].push(topupCount);
            });
        });
    }

    $scope.changeDTCTable = function(d,topCnt){
        $scope.dtc = {};
        $scope.dtc.labels = [];
        $scope.dtc.series = [];
        $scope.dtc.data = [];
        $scope.dtc.options = {legend: {display:true}};

        if(d==null)
            return;

        d.stats.forEach(function (entry){
            $scope.dtc.labels.push($scope.formatTime(entry.ts, $scope.mode));
        });

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryTopupTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        } else {
            return;
        }

        var destinationList = $scope.destinationList;
        if(showflag === 'destination') {
            destinationList = [$scope.destStr];
        } else if(showflag === 'country') {
            destinationList = destinationList.filter(function (destination) {
                var cn = destination.split('-');
                return cn[0] === $scope.countryStr;
            });
        }
        destinationList.forEach(function (destination, i) {
            $scope.dtc.series.push(destination);
            $scope.dtc.data[i] = [];
            d.stats.forEach(function (entry){
                var topupCount = 0;
                filterObj.filter(entry).forEach(function (val) {
                    var na = val.country + '-' + val.operator_name;
                    if(na==destination){
                        if(val.code === 'RECHARGE_COMPLETE'){
                            topupCount += val.count;
                        }
                    }
                });
                $scope.dtc.data[i].push(topupCount);
            });
        });
        if($scope.dtc.data.length > 10) {
            $scope.dtc.data = $scope.dtc.data.slice(0, 10);
            $scope.dtc.series = $scope.dtc.series.slice(0, 10);
        }
    }

    $scope.changeATCTable = function(d,topCnt){
        $scope.atc = {};
        $scope.atc.labels = [];
        $scope.atc.series = [];
        $scope.atc.data = [];
        $scope.atc.options = {legend: {display:true}};

        d.stats.forEach(function (entry){
            $scope.atc.labels.push($scope.formatTime(entry.ts, $scope.mode));
        });

        var accounts = d.top10_accounts.slice(0, 10);
        var accountIDs;
        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            if(topCnt == 'Top5') {
                accounts = accounts.slice(0, 5);
                accountIDs = accounts.map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            } else {
                accountIDs = accounts.map(function(account) {return account._id});
                filterObj = new AccountTopupTransFilter(showflag, accountIDs);
            }
        } else if(showflag === 'country'){            
            filterObj = new AccountTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new AccountTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.productType);
        } else {
            return;
        }

        accounts.forEach(function (e, index){
            $scope.atc.series[index] = e.name;
            $scope.atc.data[index] = [];
            d.stats.forEach(function (entry){
                var topupCount = 0;
                filterObj.filter(entry).forEach(function (val){
                    if(val.account_name==e.name){
                        if(val.code === 'RECHARGE_COMPLETE'){
                            topupCount +=val.count;
                        }
                    }
                });
                $scope.atc.data[index].push(topupCount);
            });
        });
    }

    $scope.changeSFTable = function(d,topCnt){
        $scope.sf = {};
        $scope.sf.labels = [];
        $scope.sf.series = ['Successful', 'Failed'];
        $scope.sf.data = [];
        $scope.sf.data[0] = [];
        $scope.sf.data[1] = [];
        $scope.sf.options = {legend: {display: true}};

        var showflag = $scope.showtransflag;
        var filterObj;

        if(showflag === 'country'){            
            filterObj = new CountryTopupTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryTopupTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountTopupTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryTopupTransFilter(showflag, $scope.productType);
        }

        if($scope.showtransflag === 'default'){
            d.stats.forEach(function (entry, i) {
                //sf
                var da = entry.suxx_vs_fail;
                if(da!==undefined){
                    $scope.sf.labels.push($scope.formatTime(entry.ts, $scope.mode));
                    $scope.sf.data[0][i] = [];
                    $scope.sf.data[1][i] = [];
                    $scope.sf.data[0][i] = da.successful;
                    $scope.sf.data[1][i] = da.failed;    
                }
                //sf
            });
        } else {
            d.stats.forEach(function (entry, i) {
                $scope.sf.labels.push($scope.formatTime(entry.ts, $scope.mode));
                $scope.sf.data[0][i] = 0;
                $scope.sf.data[1][i] = 0;
                filterObj.filter(entry).forEach(function (e) {
                    if(e.code === 'RECHARGE_COMPLETE'){
                        $scope.sf.data[0][i] += e.count;
                    } else {
                        $scope.sf.data[1][i] += e.count;
                    }
                });
            });
        }
    }

    $scope.changeChannelTable = function(d,topCnt){
        $scope.ch = {};
        $scope.ch.labels = [];
        $scope.ch.series = ['Web', 'API', 'PIN Portal', 'IVR'];
        $scope.ch.data = [];
        $scope.ch.data[0] = [];
        $scope.ch.data[1] = [];
        $scope.ch.data[2] = [];
        $scope.ch.data[3] = [];
        $scope.ch.options = {legend: {display: true}};
        
        d.stats.forEach(function (entry, i) {
            //ch
            var dc = d.stats[i].topups_by_channel;
            if(dc!==undefined){
                $scope.ch.labels.push($scope.formatTime(entry.ts, $scope.mode));
                $scope.ch.data[0][i] = [];
                $scope.ch.data[1][i] = [];
                $scope.ch.data[2][i] = [];
                $scope.ch.data[3][i] = [];
                $scope.ch.data[0][i] = dc.web;
                $scope.ch.data[1][i] = dc.api;
                $scope.ch.data[2][i] = dc.pinp;
                $scope.ch.data[3][i] = dc.ivr;    
            }
            //ch
        });
    }

    $scope.changeCurrencyTurnover = function(d,topCnt){
        $scope.curTurnoverList = [];
        d.stats.forEach(function (entry){
            if(entry.top10_accounts_paid!==undefined){
                entry.top10_accounts_paid.forEach(function (val){
                    index = -1;
                    for(var i=0;i<$scope.curTurnoverList.length;i++){
                        var temp = $scope.curTurnoverList[i];
                        if(temp.cur == val.currency){
                            index = i;
                            break;
                        }
                    }
                    if(index!=-1){
                        var temp = $scope.curTurnoverList[index];
                        temp.count+=val.count;
                        temp.amount+=val.amount;
                    } else {
                        var temp ={};
                        temp.cur = val.currency;
                        temp.count = val.count;
                        temp.amount = val.amount;
                        $scope.curTurnoverList.push(temp);
                    }
                })
            }
        });
    }

    $scope.changeTCCGraph = function(d,topCnt){
        $scope.tcc = {};
        $scope.tcc.labels = [];
        $scope.tcc.series = [];
        $scope.tcc.data = [];
        $scope.tcc.options = {legend: {display:true}};    

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.productType);
        }

        d.stats.forEach(function (entry){
            $scope.tcc.labels.push($scope.formatTime(entry.ts, $scope.mode));
        })

        for(var i=0;i<$scope.balances2.length;i++){
            $scope.tcc.data[i] = [];
            $scope.tcc.series[i] = $scope.balances2[i];
            d.stats.forEach(function(entry){
                var topupCount = 0;
                filterObj.filter(entry).forEach(function(val){
                    if(val.currency === $scope.balances2[i] && val.code === 'RECHARGE_COMPLETE'){
                        topupCount += val.count;
                    }
                })
                $scope.tcc.data[i].push(topupCount);
            })
        }

    }

    $scope.changeProductTable = function (d, topCnt) {
        var productDict = {}
        var products = [];
        
        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.productType);
        }

        d.stats.forEach(function (stat) {
            filterObj.filter(stat).forEach(function (entry) {
                if(entry.code === 'RECHARGE_COMPLETE'){
                    var productType = entry.type;
                    var productCurrency = entry.currency;
                    if(!productDict[productType]) {
                        productDict[productType] = {};
                    }
                    if(!productDict[productType][productCurrency]) {
                        productDict[productType][productCurrency] = {
                            amount: 0,
                            count: 0
                        };
                    }
                    productDict[productType][productCurrency].amount += entry.amount;
                    productDict[productType][productCurrency].count += entry.count;
                }
            })
        })
        
        Object.keys(productDict).forEach(function (productType) {
            Object.keys(productDict[productType]).forEach(function (productCurrency) {
                products.push(
                    new Product(
                        Object.assign({
                            type: productType,
                            currency: productCurrency,
                        }, productDict[productType][productCurrency])
                    )
                );
            });
        });
        $scope.ptc = products;
    }

    $scope.changeProductGraph = function (d, topCnt) {
        var productTypes = ProductType.TYPE_STRINGS;

        var graphData = {
            labels: [],
            series: [],
            data: [],
            options: {legend: {display: true}}
        };

        var products = {};

        var showflag = $scope.showtransflag;
        var filterObj;
        if(showflag === 'default'){
            var accounts = d.top10_accounts;
            if(topCnt == 'Top5') {
                accountIDs = accounts.slice(0, 5).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else if(topCnt == 'Top10') {
                accountIDs = accounts.slice(0, 10).map(function(account) {return account._id});
                filterObj = new AccountPaidTransFilter(showflag, accountIDs);
            } else {
                filterObj = new CountryPaidTransFilter(showflag);
            }
        } else if(showflag === 'country'){            
            filterObj = new CountryPaidTransFilter(showflag, $scope.countryStr);
        } else if(showflag === 'destination'){
            filterObj = new CountryPaidTransFilter(showflag, $scope.destStr);
        } else if(showflag === 'agent') {
            filterObj = new AccountPaidTransFilter(showflag, $scope.agentID);
        } else if(showflag === 'provider') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.providerStr);
        } else if(showflag === 'producttype') {
            filterObj = new CountryPaidTransFilter(showflag, $scope.productType);
        } else {
            return;
        }

        d.stats.forEach(function (stat) {
            graphData.labels.push($scope.formatTime(stat.ts, $scope.mode));
        });
        
        d.stats.forEach(function (stat, index) {            
            Object.keys(products).forEach(function (productType) {
                products[productType][index] = 0;
            });
            filterObj.filter(stat).forEach(function (topupEntry) {
                if(topupEntry.code === 'RECHARGE_COMPLETE'){
                    var productType = productTypes[topupEntry.type];
                    if(!products[productType]) {
                        products[productType] = new Array(index + 1).fill(0);
                    }
                    products[productType][index] += topupEntry.count;
                }
            })
        })
        graphData.series = Object.keys(products);
        graphData.data = Object.values(products);
        
        $scope.ptcg = graphData;
    }

    $scope.formatTime = function (time, mode) {
        var dayMode = ['today', 'daily', 'custom_day'];
        var weekMode = ['this_week', 'weekly', 'custom_week'];
        var monthMode = ['this_month', 'monthly', 'custom_month'];
        var yearMode = ['this_year', 'yearly', 'custom_year'];

        if(dayMode.indexOf(mode) != -1) {
            return moment(time).format('HH:00');
        } else if(weekMode.indexOf(mode) != -1) {
            return moment(time).format('DD.MM.YYYY');
        } else if(monthMode.indexOf(mode) != -1) {
            return moment(time).format('DD.MM.YYYY');
        } else if(yearMode.indexOf(mode) != -1) {
            return moment(time).format('MM.YYYY');
        }
    }

    $scope.showDashboard = function(d,topCnt){
        $scope.topCountries(d);
        $scope.topAccounts(d);
        $scope.topDestinations(d);

        // Get Providerlist
        $scope.getProviderList(d);

        // Get ProductTypes
        $scope.getProductTypes(d);

        //GetBalances
        $scope.getBalances(d);
        if($scope.showtransflag==='agent'){
            $scope.currency = $scope.agentCur;
        }

        ///top10_countries_topup_count graph
        $scope.changeCTCTable(d,topCnt);

        ///top10_destinations_topup_count graph
        $scope.changeDTCTable(d,topCnt);

        ///transactions by all graph
        $scope.changeTransByAll(d,topCnt);

        ///top10_countries_topup_amount graph
        $scope.changeTCTable(d,topCnt);

        ///top10_destination_topup_amount graph
        $scope.changeTDATable(d,topCnt);
        
        ///transcount for total amount money in the system
        $scope.changeTransCount();
        
        ///top10_accounts_topup_count graph
        $scope.changeATCTable(d,topCnt);

        //turnover table
        $scope.changeTurnoverTable(d,topCnt);

        //Successful vs. Failed Topups (count)
        $scope.changeSFTable(d,topCnt);

        ///Topup count by Channel 
        $scope.changeChannelTable(d,topCnt);

        ///Currency Turnover by Agents
        $scope.changeCurrencyTurnover(d,topCnt);

        ///Turnover by Provider
        $scope.changeTCPTable(d,topCnt);

        ///topupcount by Provider
        $scope.changeTCPGraph(d,topCnt);
        
        //top count by currency
        $scope.changeTCCGraph(d,topCnt);
        
        //Total topup amount & count table by product type
        $scope.changeProductTable(d, topCnt);

        //Topup amount & count graph by product type
        $scope.changeProductGraph(d, topCnt);
    }

    var timer_flag = true;
    var startTimer = function() {
        $scope.timer = $interval(function(){
            console.log("aaaaaaa");
            if (timer_flag) {
                timer_flag = false;
                api.getAccountsWallet($scope.accountIdList)
                .then(function(accs){
                    for(var i =0;i<accs.length;i++){
                        $scope.accountWallets[accs[i]['account_name']] = accs[i]['wallets'];
                    }
                    timer_flag = true;
                })
            }
        }, 300000);
    }
    $scope.$on('$destroy', function() {
        if($scope.modeObj) {
            $scope.modeObj.destroy();
        }
    });
    
}]);

//// --- DashboardController End --- ////


//DateSelectController
angular.module('billinguiApp')
.controller('DateSelectController', ['$uibModalInstance', '$scope', 'api', '$stateParams',  function ($uibModalInstance, $scope, api, $stateParams) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }
    $scope.select = function () {
        $scope.selectedDate = $scope.year_sel+'-'+$scope.month_sel+'-'+$scope.week_sel+'-'+$scope.day_sel;
        $uibModalInstance.close($scope.selectedDate);
    }
    $scope.updateDate = function () {
        
    }
}]);
