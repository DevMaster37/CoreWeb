function TransferModalProps() {
    this.tdata = {}
    this.tdata.accounts = [];
    this.tdata.sourceWallets = [];
    this.tdata.destWallets = [];
    this.tdata.rates = [];
    this.tdata.sourceAccount = null;
    this.tdata.destAccount = null;
    this.rec = {}
    this.rec.source = null;
    this.rec.destination = null;
    this.rec.amount = null;
    this.rec.sourcecur = null;
    this.rec.destcur = null;
    return this;
}

angular.module('billinguiApp')
.controller('TransferModalController', ['$uibModalInstance', '$scope', 'api', 'props', function ($uibModalInstance, $scope, api, props) {
    api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        $scope.distr = prof.account_type == 'wholesaler';
    });
    $scope.rec = props.rec;
    $scope.tdata = props.tdata;

    $scope.updateWalletList = function () {
        api.getWallets($scope.tdata.sourceAccount)
            .then(function (wa) {
                $scope.tdata.sourceWallets = wa.wallets;
                return api.getWallets($scope.tdata.destAccount);
            })
            .then(function (wb) {
                vm.tdata.destWallets = wb.wallets;

            })
    }

    $scope.transferFundsOK = function () {
        var obj = {
            destination: $scope.tdata.destination,
            amount: $scope.rec.amount,
            description: $scope.rec.description
        };
        api._post('/accounts/' + $scope.tdata.destAccount + '/topup', obj)
            .then(function (tx) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
    };
    $scope.transferVFundsOK = function () {
        var obj = {
            destination: $scope.tdata.destination,
            amount: $scope.rec.amount,
            description: $scope.rec.description
        };
        api._post('/accounts/' + $scope.tdata.destAccount + '/vtopup', obj)
            .then(function (tx) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
    };
}]);

//UserModalController
angular.module('billinguiApp')
    .controller('UserModalController', ['$uibModalInstance', '$scope', 'api', 'items', 'Upload', function ($uibModalInstance, $scope, api, items, Upload) {
        api.getProfile()
        .then(function (prof) {
            $scope.profile = prof;
            $scope.distr = prof.account_type == 'wholesaler';
        });
        api.getAccount(items.id)
            .then(function (acc) {
                $scope.account = acc;
                $scope.dontshowchild = acc.type == 'agent';
            });
            
        $scope.change_rate = function () {
            var x = $scope.rec;
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            var parent_pct = 0;
            Object.keys($scope.parentProfit).forEach(function (key) {
                if (key == code)
                    parent_pct = $scope.parentProfit[key];
            })
            $scope.rec.profit_pct = 100 - ((100 * $scope.rec.profit_rate) / $scope.currentRate ) - parent_pct;
        }
        $scope.change_pct = function () {
            var x = $scope.rec;
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            var parent_pct = 0;
            Object.keys($scope.parentProfit).forEach(function (key) {
                if (key == code)
                    parent_pct = $scope.parentProfit[key];
            })
            $scope.rec.profit_rate = (100 - $scope.rec.profit_pct - parent_pct) * $scope.currentRate / 100;
        }

        $scope.accountsCancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.deleteOK = function () {
            $scope.masteruser = '';
            for (var i = 0; i < $scope.childrens.length; i++) {
                if ($scope.iswholesaler) {
                    api.getChildAccounts($scope.childrens[i]._id)
                        .then(function (accounts) {
                            var child_children = accounts.accounts;
                            for (var j = 0; j < child_children.length; j++) {
                                api.deleteAccount(child_children[j]._id)
                                    .then(function (d) {
                                    })
                                    .catch(function (err) {
                                    })
                            }
                        })
                    api.deleteAccount($scope.childrens[i]._id)
                        .then(function (d) {
                        })
                        .catch(function (err) {
                        })
                }
            }
            api.deleteAccount($scope.recid)
                .then(function (d) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.updateeditableOperList = function () {
            var country = $scope.acl_country.iso;
            if (country == 'ALL') {
                $scope.AclOperators = [];
                $scope.canSelectOper = true;
                var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                $scope.AclOperators.push(alloperators);
            } else {
                api.getOperators(country)
                    .then(function (op) {
                        $scope.AclOperators = [];
                        var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                        $scope.AclOperators.push(alloperators);
                        for (var i = 0; i < op.length; i++) {
                            $scope.AclOperators.push(op[i]);
                        }
                        $scope.canSelectOper = true;
                    });
            }
        }
        $scope.showPP = function () {
            $scope.rec.profit_pct = 0;
            var subflag = false;
            for (var i = 0; i < $scope.subWallet.length; i++) {
                if ($scope.subWallet[i] == $scope.rate_symbol) {
                    subflag = true;
                    $scope.currentRate = 1;
                }
            }
            if (!subflag) {
                var cur_usd = $scope.currencyRate[$scope.mainWallet];
                $scope.currentRate = $scope.currencyRate[$scope.rate_symbol] / cur_usd;
            }
            $scope.rec.profit_rate = (100 - $scope.rec.profit_pct) * $scope.currentRate / 100;
            $scope.showMPP = true;
        }
        $scope.editOperator = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
        }
        $scope.editProfit = function () {
            var country = $scope.acl_country.iso;
            $scope.rec.profit_pct = '';
            $scope.currentRate = '';
            $scope.rec.profit_rate = '';
            if (country == 'ALL') {
                $scope.AclOperators = [];
                //$scope.AclOperators.push({operator_id: 'ALL', operator_name: 'ALL Operators'});
                $scope.rate_symbol = '';
            } else {
                var currencyval = $scope.country_currency[country];
                $scope.rate_symbol = currencyval;
                var subflag = false;
                for (var i = 0; i < $scope.subWallet.length; i++) {
                    if ($scope.subWallet[i] == $scope.rate_symbol) {
                        subflag = true;
                        $scope.currentRate = 1;
                    }
                }
                if (!subflag) {
                    var cur_usd = $scope.currencyRate[$scope.mainWallet];
                    $scope.currentRate = $scope.currencyRate[$scope.rate_symbol] / cur_usd;
                }
                api.getOperators(country)
                    .then(function (op) {
                        $scope.AclOperators = [];
                        var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                        $scope.AclOperators.push(alloperators);
                        $scope.acl_operator = $scope.AclOperators[0];
                        for (var i = 0; i < op.length; i++) {
                            $scope.AclOperators.push(op[i]);
                        }
                    });
            }
        }
        
        $scope.editCredentialOK = function () {
            api.updateCredentialAccount(items.id, $scope.rec._id, $scope.rec)
                .then(function (bc) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.editAclEntryOK = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }

            o.active = true;
            if ($scope.rec.acltype == 'block') {
                for (var i = 0; i < $scope.AccessList.block.length; i++) {
                    if ($scope.AccessList.block[i].code == $scope.editacl.code) {
                        $scope.AccessList.block[i] = o;
                        break;
                    }
                }
            } else if ($scope.rec.acltype == 'allow') {
                for (var i = 0; i < $scope.AccessList.allow.length; i++) {
                    if ($scope.AccessList.allow[i].code == $scope.editacl.code) {
                        $scope.AccessList.allow[i] = o;
                        break;
                    }
                }
            }
            $uibModalInstance.close();
        }
        $scope.newAclEntryOK = function () {
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }

            o.active = true;
            if (x.acltype == 'allow') {
                $scope.AccessList.allow.push(o)
            } else if (x.acltype == 'block') {
                $scope.AccessList.block.push(o);
            }
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.newWalletOK = function () {
            api.createWallet($scope.account._id, $scope.rec)
                .then(function (w) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newCredentialOK = function () {
            api.createCredentialAccount($scope.account._id, $scope.rec)
                .then(function (x) {
                    $uibModalInstance.close();
                })
                .catch(function (e) {
                    $uibModalInstance.dismiss(e);
                })
        }
        $scope.editWalletOK = function () {
            api.updateWallet($scope.account._id, $scope.rec._id, $scope.rec)
                .then(function (w) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newPentryOK = function () {
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }
            o.profit_pct = x.profit_pct;
            o.profit_rate = x.profit_rate + ' ' + $scope.rate_symbol;
            o.active = true;
            $scope.ProfitMap.maps.push(o);
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.newFPentryOK = function () {
            var x = $scope.rec;
            var o = {}
           o = x;
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            $scope.FixedProfitMap.maps.push(o);
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.editPentryOK = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }
            o.profit_pct = x.profit_pct;
            o.profit_rate = x.profit_rate + ' ' + $scope.rate_symbol;
            o.active = true;
            for (var i = 0; i < $scope.ProfitMap.maps.length; i++) {
                if ($scope.ProfitMap.maps[i].code == $scope.oldPentry.code) {
                    $scope.ProfitMap.maps[i] = o;
                    break;
                }
            }
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.editFPentryOK = function () {
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
           o = x;
           o.code = code;
            for (var i = 0; i < $scope.FixedProfitMap.maps.length; i++) {
                if ($scope.FixedProfitMap.maps[i].code == $scope.oldPentry.code) {
                    $scope.FixedProfitMap.maps[i] = o;
                    break;
                }
            }
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.transferFundsOK = function () {
            var obj = {
                destination: $scope.tdata.destination.split(':')[0],
                amount: $scope.rec.amount,
                description: $scope.rec.description
            };
            api.topupAcc($scope.tdata.destAccount._id, obj)
                .then(function (tx) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        };
        $scope.uploadAvatar = function (file, errFiles) {
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                file.upload = Upload.upload({
                    url: '/api/accounts/' + $scope.account._id + '/users/' + $scope.user._id + '/avatar?token=' + $scope.profile.token,
                    data: {userPhoto: file}
                });

                file.upload.then(function (response) {
                    $timeout(function () {
                        file.result = response.data;
                    });
                }, function (response) {
                    if (response.status > 0)
                        $scope.errorMsg = response.status + ': ' + response.data;
                }, function (evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            }
        }
        $scope.newUserOK = function () {
            if ($scope.user.password == $scope.user.passwordconfirm) {
                delete $scope.user.passwordconfirm;
                api.createUser(items.id, $scope.user)
                    .then(function (u) {
                        console.log(u);
                    })
                $uibModalInstance.close();
            }

        }
        $scope.newUserCancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.editUserOK = function () {
            var nobj = {};
            for (key in $scope.user) {
                if ((key == 'main_account') || (key == '__v') || (key == '_id') || (key == 'createdAt') || (key == 'last_login') || (key == 'updatedAt') || (key == 'password') || (key == 'passwordconfirm'))
                    continue;
                nobj[key] = $scope.user[key];
            }
            if ($scope.user.password) {
                if ($scope.user.password == $scope.user.passwordconfirm) {
                    //ok
                    nobj.password = $scope.user.password;
                }
            }
            //update....
            api.editUser(items.id, $scope.user._id, nobj)
                .then(function (u) {


                })
                .catch(function (err) {
                    console.log(err);
                })
            $uibModalInstance.close();
        }
        $scope.deleteUserOK = function () {
            if ($scope.uconfirm == $scope.user.username) {
                api.deleteUser(items.id, $scope.user._id)
                    .then(function (uu) {
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
                $uibModalInstance.close();
            } else {
                console.log('not match')
            }
        }
        $scope.deleteCredOK = function () {

            api.deleteCredentialAccount(items.id, $scope.recid)
                .then(function (uu) {

                })
                .catch(function (err) {
                    console.log(err);
                })
            $uibModalInstance.close();
        }
        $scope.newFinRecOK = function () {
            if ($scope.rec.primary) {

            } else {
                $scope.rec.primary = false;
            }
            var upd = {};
            upd.financial = [];
            $scope.account.financial.forEach(function (f) {
                upd.financial.push(f);
            })
            console.log('REC:', $scope.rec);
            upd.financial.push($scope.rec);
            api.updateAccount(items.id, upd)
                .then(function (up) {
                    $uibModalInstance.close();
                })
        }
        $scope.topupOK = function () {
            console.log('i am being called')
            var upd = {};
            upd.amount = $scope.top.amt;
            upd.reason = $scope.top.reason;
            api.topupAcc(items.id, upd)
                .then(function (up) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    console.log('big badaaaa boom')
                })
        }
        $scope.deleteFinRecordOK = function () {
            var nob = {};
            nob.financial = [];
            $scope.account.financial.forEach(function (f) {
                if (f._id == $scope.recid) {

                } else {
                    nob.financial.push(f);
                }
            });
            api.updateAccount(items.id, nob)
                .then(function (n) {
                    $uibModalInstance.close();
                })
        }
        $scope.editFinRecordOK = function () {
            var nob = {};
            nob.financial = [];
            $scope.account.financial.forEach(function (f) {
                if (f._id == $scope.recid) {

                } else {
                    nob.financial.push(f);
                }
            });
            nob.financial.push($scope.rec);
            api.updateAccount(items.id, nob)
                .then(function (u) {
                    $uibModalInstance.close();
                })
        }
        $scope.editSubOK = function () {
            console.log(' ok was clicked editSubOK ', $scope.sub)
            api.editSubscription(items.id, $scope.recid, $scope.sub)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.createSubOK = function () {
            if ($scope.sub.subscription_type == 'package') {
                $scope.sub.quantity = 1;
            }
            api.createSubscription(items.id, $scope.sub)
                .then(function (s) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.deleteSubOK = function () {
            api.deleteSubscription(items.id, $scope.recid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.editRouteOK = function () {
            var bind = $scope.route;
            delete bind.rates;

            api.editRoute(items.id, $scope.recid, bind)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.createRouteOK = function () {
            api.createRoute(items.id, $scope.route)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.deleteRouteOK = function () {
            api.deleteRoute(items.id, $scope.recid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newAssignmentOK = function () {
            if ($scope.account.available_routes.contains($scope.route.parent_route)) {
                $uibModalInstance.dismiss();
            } else {
                $scope.account.available_routes.push($scope.route.parent_route);
                var upd = {};
                upd.available_routes = [];
                upd.available_routes = $scope.account.available_routes;
                api.updateAccount(items.id, upd)
                    .then(function (f) {
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        $uibModalInstance.dismiss(err);
                    })
            }

        }
        $scope.deleteAssignmentOK = function () {

            var upd = {};
            upd.available_routes = [];
            $scope.account.available_routes.forEach(function (f) {
                if (f == $scope.recid) {

                } else {
                    upd.available_routes.push(f);
                }
            });
            api.updateAccount(items.id, upd)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.cancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.newCCOK = function () {
            console.log($scope.account.permitted_apis, $scope.baa.apid)
            $scope.account.permitted_apis.push($scope.baa.apid);
            $uibModalInstance.close();
        }
        $scope.newIPOK = function () {
            $scope.account.appfw_whitelist.push($scope.baa.ip);
            $uibModalInstance.close();
        }
    }]);
