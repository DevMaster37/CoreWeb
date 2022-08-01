//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
    .controller('SrController', ['$scope', 'api', '$location', '$uibModal', '$timeout', '$stateParams', 'ngProgressFactory', 'localStorageService', function ($scope, api, $location, $uibModal, $timeout, $stateParams, ngProgressFactory, localStorageService) {
        if (api.isAuthed()) {

            $scope.progressbar = ngProgressFactory.createInstance();
            console.log($scope.progressbar);
            $scope.progressbar.start();

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
                $("#sr").css('active');

            }


            $scope.SelectFile = function (file) {
                $scope.SelectedFile = file;
            };

            $scope.Upload = function () {
                var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.xls|.xlsx)$/;
                var filename = $scope.SelectedFile.name.toLowerCase();
                var fileextension = filename.substr(filename.lastIndexOf('.') + 1);



                if (regex.test($scope.SelectedFile.name.toLowerCase())) {
                    if (typeof (FileReader) != "undefined") {

                        if (fileextension == "csv") {
                            var reader1 = new FileReader();
                            reader1.onload = function (e) {

                                var ptype = $scope.list;
                                var pdate = $scope.date;
                                var total_amount = 0;

                                //var customers = new Array();
                                var result = e.target.result;
                                var rows = result.split("\r\n");
                                var rowlenght = rows.length;

                                var sum = 0;
                                var arrValues = new Array();
                                var lines = [];
                                var headers = rows[0].split(',');
                                for (var i = 0; i < rowlenght; i++) {
                                    var cells = rows[i].split(",");
                                    var crun = 0;
                                    if (cells.length == headers.length) {
                                        var tarr = [];
                                        for (var j = 0; j < headers.length; j++) {


                                            if (ptype == "1" && cells[8].trim() == "SUCCESS") {//BP
                                                if (j == 4) {
                                                    if (cells[j] == "") {
                                                        crun = 1;
                                                    }
                                                    if (Number(cells[j])) {
                                                        tarr.push(cells[j]);
                                                        total_amount = total_amount + parseInt(cells[j]);
                                                    }
                                                }

                                            }

                                            if (ptype == "2" && cells[8].trim() == "Fulfilled") { //IR
                                                if (j == 3) {
                                                    if (cells[j] == "") {
                                                        crun = 1;
                                                    }

                                                    if (Number(cells[j])) {
                                                        tarr.push(cells[j]);
                                                        total_amount = total_amount + parseInt(cells[j]);
                                                    }
                                                }

                                            }

                                            if (ptype == "3" && cells[6].trim() == "1") {//PU
                                                if (j == 2) {
                                                    if (cells[j] == "") {
                                                        crun = 1;
                                                    }
                                                    if (Number(cells[j])) {
                                                        tarr.push(cells[j]);
                                                        total_amount = total_amount + parseInt(cells[j]);
                                                    }
                                                }

                                            }

                                            if (ptype == "4") {//FT
                                                if (j == 8) {
                                                    if (cells[j] == "") {
                                                        crun = 1;
                                                    }
                                                    if (Number(cells[j])) {
                                                        tarr.push(cells[j]);
                                                        total_amount = total_amount + parseInt(cells[j]);
                                                    }
                                                }

                                            }
                                        }
                                        if (crun == 1) {
                                            break;
                                        }
                                        lines.push(tarr);
                                    }

                                }
                                console.log(total_amount)
                                api._post('/salesreport', {'amount': total_amount, 'ptype': ptype, 'date': pdate})
                                    .then(function (d) {
                                        console.log(d)
                                    })


                            }
                            reader1.readAsText($scope.SelectedFile);
                        }


                        if (fileextension == "xls" || fileextension == "xlsx") {
                            var reader2 = new FileReader();
                            //For Browsers other than IE.
                            if (reader2.readAsBinaryString) {
                                reader2.onload = function (e) {
                                    $scope.ProcessExcel(e.target.result);
                                };
                                reader2.readAsBinaryString($scope.SelectedFile);
                            } else {
                                var reader3 = new FileReader();
                                //For IE Browser.
                                reader3.onload = function (e) {
                                    var data = "";
                                    var bytes = new Uint8Array(e.target.result);
                                    for (var i = 0; i < bytes.byteLength; i++) {
                                        data += String.fromCharCode(bytes[i]);
                                    }
                                    $scope.ProcessExcel(data);
                                };
                                reader3.readAsArrayBuffer($scope.SelectedFile);
                            }

                        }


                    } else {
                        $window.alert("This browser does not support HTML5.");
                    }
                } else {
                    $window.alert("Please upload a valid CSV file.");
                }
            }


            $scope.ProcessExcel = function (data) {
                var workbook = XLSX.read(data, {
                    type: 'binary'
                });

                var firstSheet = workbook.SheetNames[0];
                var excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);

                var ptype = $scope.list;
                var pdate = $scope.date;
                var total_amount = 0;

                for(let val of excelRows) {
                    var crun = 0;
                    if (ptype == "1" && val.vendStatus.trim() == "SUCCESS") {//BP*
                            if (val.vendStatus == "") {
                                crun = 1;
                            }
                            if (Number(val.amount)) {
                                total_amount = total_amount + parseInt(val.amount);
                            }

                    }

                    if (ptype == "2" && val.Status.trim() == "Fulfilled") {//IR*
                        console.log(val);
                        if (val.Status == "") {
                            crun = 1;
                        }
                        if (Number(val.Amount (NGN))) {
                            total_amount = total_amount + parseInt(val.Amount (NGN));
                        }

                    }

                    if (ptype == "3" && val.status.trim() == "1") {//PU*
                        if (val.status == "") {
                            crun = 1;
                        }
                        if (Number(val.amount)) {
                            total_amount = total_amount + parseInt(val.amount);
                        }

                    }

                    if (ptype == "4") {//FT*
                        if (val.Amount == "") {
                            crun = 1;
                        }
                        if (Number(val.Amount)) {
                            total_amount = total_amount + parseInt(val.Amount);
                        }
                    }

                    if (crun == 1) {
                        break;
                    }

                }
                console.log(total_amount)
                api._post('/salesreport', {'amount': total_amount, 'ptype': ptype, 'date': pdate})
                    .then(function (d) {
                        console.log(d)
                    })
            };


            $scope.detailView = function (id) {
                api._get('/salesreport/' + id)
                    .then(function (x) {
                        $scope.drec = x;
                        $scope.viewSales = false;
                        $scope.viewDetail = true;

                    })

            }
            $scope.popup1 = {
                opened: false
            };
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };

            $scope.displaybg = function (num1, num2) {

                var caser = "background-color: forestgreen; color: white; padding:0px 5px 0px 5px;";

                if (num1 > num2) {
                    caser = "background-color:black; color: white; padding:0px 5px 0px 5px;";
                }

                if (num2 > num1) {
                    caser = "background-color: brown; color: white; padding:0px 5px 0px 5px;";
                }
                return caser;
            };

            $scope.countjson = function (json) {
                return Object.keys(json).length;
            };

            $scope.updateSalesView = function () {
                $scope.viewSales = true;
                $scope.viewDetail = false;
                api._get('/salesreport')
                    .then(function (x) {
                        $scope.salelist = x
                        $scope.progressbar.complete();

                    })
            }


            $scope.updateSalesView();
            //$scope.load();
        } else {
            $location.path('/login');
        }

    }]);
