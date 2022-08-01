var app = {};
var https = require('request');
var md5 = require('md5')
var sha1 = require('sha1');
var pp = require('properties-parser');
var easysoap = require('easysoap')
var soap = require('soap');
var xml2js = require('xml2js')
var xml2json = require('xml2json')
var util = require('util')
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
app.ping = function (api_id) {
   return new Promise(function (resolve, reject) {
          switch (api_id) {
        
        case "TRTO":
            var key = new Date().getTime();
            var url = process.env.TRTO_URL + '?login=' + process.env.TRTO_LOGIN + '&key=' + key + '&md5=' + md5(process.env.TRTO_LOGIN + process.env.TRTO_TOKEN + String(key)) + '&action=ping';
                                var options = {
                        url: url,
                        strictSSL: false,
                        secureProtocol: 'TLSv1_method',
                            ciphers : 'ALL'
                    }
            https(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var obj = pp.parse(body);
                    if (obj.error_code == '0' && obj.info_txt == 'pong') {
                        resolve(obj);
                    } else {
                        reject(obj.error_txt);
                    }
                } else {
                    reject(err);
                }
            })
            break;
        case "TRLO":
            console.log('TRLO_PING')
            var key = new Date().getTime();
            var soapHeader = '';
            var payload = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\"> ' +
               ' <soapenv:Header/> ' +
               ' <soapenv:Body>' +
                  '  <tem:Ping/> '+
                '</soapenv:Body>'+
                '</soapenv:Envelope>';
                var pr = {
                    url : 'https://52.76.149.97:9001/API/GloReload.svc/soap',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://tempuri.org/IGloTransfer/Ping'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                   console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        if (err) {
                            reject(err)
                        } else {
                            var pre = d['s:Envelope']['s:Body'][0]['PingResponse'][0]['PingResult'][0];
                            if (pre == 1) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                        }
                    });
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                   
                    req.end(payload);
                /*
            soap.createClient(process.env.TRLO_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader();
                    cl.addHttpHeader('Content-Type', 'application/soap+xml')
                    var args = {
                        transID : key,
                        UserID : process.env.TRLO_LOGIN,
                        Password : process.env.TRLO_PASS
                    }
                    cl.Ping('', function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            if (res.PingResult == '1') {
                                resolve(res);
                            } else {
                                reject(new Error('offline'));
                            }
                        }
                    })
                }
            });
            */
        break;
        case "ETRX":
         console.log('ETRX_PING')
            var key = new Date().getTime();
            var soapHeader = '';
            soap.createClient(process.env.ETRX_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        request : {
                        terminalId : process.env.ETRX_USER,
                        action : 'BL',
                        transaction : {
                            pin : process.env.ETRX_PASS,
                            reference : key
                        }
                        }
                        
                    }
            
                    cl.process(args, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(res)
                            resolve(res);
                        }
                    })
                }
            });
        break;
        case "SSLW":
         console.log('SSLW_PING')
            var key = new Date().getTime();
            var soapHeader = '';
            soap.createClient(process.env.SSLW_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        client_id : process.env.SSLW_USER
                        }
                        
                    
            
                    cl.GetClientInfo(args, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(res)
                            resolve(res);
                        }
                    })
                }
            });
        break;
        case "MFIN":
        var key = new Date().getTime();
        var c1 = process.env.MFIN_LOGIN + '|' + String(key) + '|' + process.env.MFIN_PASS;
        var c2 = md5(sha1(c1));
        var payload = '<soapenv:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:res=\"http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php\">' +
   '<soapenv:Header/>'+
   '<soapenv:Body>'+
      '<res:EchoCheck soapenv:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">'+
         '<EchoCheck_Request xsi:type=\"xsd1:EchoCheck_Request\" xmlns:xsd1=\"http://soapinterop.org/xsd\">'+
            '<LoginId xsi:type=\"xsd:string\">' + process.env.MFIN_LOGIN + '</LoginId>'+
            '<Message xsi:type=\"xsd:string\">' + key + '</Message>' +
            '<Checksum xsi:type=\"xsd:string\">' + c2 + '</Checksum>' +
         '</EchoCheck_Request>' +
      '</res:EchoCheck>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>'
                var pr = {
                    url : 'http://arizonaadmin.mobifinng.com/WebService/iTopUp/reseller_itopup.server.php',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php#Reseller_iTopUp_wsdl#EchoCheck'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                   console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                   
                  
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        if (err) {
                            reject(err)
                        } else {
                            
                            var pre = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:EchoCheckResponse'][0]['EchoCheck_Response'][0]['ResponseCode'][0]['_'];
                            if (pre == 000) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                            
                        }
                    });
                    
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    req.end(payload);
        break;
        default:
            reject(new Error());
    }
   });
 
}
app.getBalance = function (api_id) {
     return new Promise(function (resolve, reject) {
          switch (api_id) {
        
        case "TRTO":
            var key = new Date().getTime();
            var url = process.env.TRTO_URL + '?login=' + process.env.TRTO_LOGIN + '&key=' + key + '&md5=' + md5(process.env.TRTO_LOGIN + process.env.TRTO_TOKEN + String(key)) + '&action=check_wallet';
                                var options = {
                        url: url,
                        strictSSL: false,
                        secureProtocol: 'TLSv1_method',
                            ciphers : 'ALL'
                    }
            https(options, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var obj = pp.parse(body);
                    if (obj.error_code == '0') {
                        var r = {};
                        r.balance = obj.balance;
                        resolve(r);
                    } else {
                        reject(obj.error_txt);
                    }
                } else {
                    reject(err);
                }
            })
            break;
        case "TRLO":
                      var key = new Date().getTime();

                var sign = md5(key + process.env.TRLO_LOGIN + process.env.TRLO_KEY);
            var soapHeader = '';
           var payload = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\" xmlns:tran=\"http://schemas.datacontract.org/2004/07/Tranglo20.Business.Processor\" xmlns:tran1=\"http://schemas.datacontract.org/2004/07/Tranglo20.Common.Entity\">'+
            '<soapenv:Header/>'+
            '<soapenv:Body>' +
                '<tem:EWallet_Enquiry>' +
                    '<tem:req>' +
                        '<tran:credential>' +
                        '<tran1:UID>' + process.env.TRLO_LOGIN + '</tran1:UID>' +
                        '<tran1:PWD>' + process.env.TRLO_PASS + '</tran1:PWD>' +
                        '<tran1:Signature>' + sign + '</tran1:Signature>' + 
                        '</tran:credential>' + 
                        '<tran:DealerTransactionId>' + key + '</tran:DealerTransactionId>' + 
                    '</tem:req>' + 
                '</tem:EWallet_Enquiry>' + 
            '</soapenv:Body>' + 
            '</soapenv:Envelope>'
                var pr = {
                    url : 'https://52.76.149.97:9001/API/GloReload.svc/soap',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://tempuri.org/IGloTransfer/EWallet_Enquiry'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                   console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                    //var json = xml2json.toJson(res.body);
                    //console.log('json', json["s:Envelope"]["s:Body"]["EWallet_EnquiryResponse"]["EWallet_EnquiryResult"]["a:LastBalance"])

                    
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        console.log(util.inspect(d, false, null))
                        console.log('ooo', d['s:Envelope']['s:Body'][0]['EWallet_EnquiryResponse'][0]['EWallet_EnquiryResult'][0]['a:LastBalance'][0]);
                        var ss = d['s:Envelope']['s:Body'][0]['EWallet_EnquiryResponse'][0]['EWallet_EnquiryResult'][0]['a:Status'][0]['b:Code'][0];
                        console.log('sta', ss)
                        if (err) {
                            reject(err)
                        } else {
                            if (ss == '000') {
                                //ok
                                var r = {};
                                r.balance = d['s:Envelope']['s:Body'][0]['EWallet_EnquiryResponse'][0]['EWallet_EnquiryResult'][0]['a:LastBalance'][0];
                                resolve(r)
                            } else {
                                reject();
                            }
                        }
                        /*
                        if (err) {
                            reject(err)
                        } else {
                            var pre = d['s:Envelope']['s:Body'][0]['PingResponse'][0]['PingResult'][0];
                            if (pre == 1) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                        }
                        */
                    });
                    
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    req.end(payload);
            break;
            case "ETRX":
                console.log('ETRX_BAL')
            var key = new Date().getTime();
            var soapHeader = '';
            soap.createClient(process.env.ETRX_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        request : {
                            terminalId : process.env.ETRX_USER,
                        action : 'BE',
                        transaction : {
                            pin : process.env.ETRX_PASS,
                            reference : key
                        }
                        }
                        
                    }
            
                    cl.process(args, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(res);
                            var r = {};
                            r.balance = res.response.message;
                            resolve(r);
                        }
                    })
                }
            });
            break;
            case "SSLW":
         console.log('SSLW_BAL')
            var key = new Date().getTime();
            var soapHeader = '';
            soap.createClient(process.env.SSLW_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        client_id : process.env.SSLW_USER
                        }
                        
                    
            
                    cl.GetBalanceInfo(args, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            console.log(res)
                            var re = {};
                            re.balance = res.stock_balance.available_credit.$value;
                            resolve(re);
                        }
                    })
                }
            });
        break;
        case "MFIN":
            var key = new Date().getTime();
            var d1 = new Date();
            var d2 = d1.getFullYear() + '-' + parseInt(d1.getMonth()+1) + '-' + d1.getDate()
        var c1 = process.env.MFIN_LOGIN + '|' + d2 + '|' + process.env.MFIN_PASS;
        var c2 = md5(sha1(c1));
        var payload = '<soapenv:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:res=\"http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php\">' +
   '<soapenv:Header/>'+
   '<soapenv:Body>'+
      '<res:ResellerBalance soapenv:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">' +
         '<ResellerBalance_Request xsi:type=\"xsd1:ResellerBalance_Request\" xmlns:xsd1=\"http://soapinterop.org/xsd\">' +
     '<LoginId xsi:type=\"xsd:string\">' + process.env.MFIN_LOGIN + '</LoginId>' +
        '<TillDate>' + d2 + '</TillDate>' +
                    '<Checksum xsi:type=\"xsd:string\">' + c2 + '</Checksum>' +
         '</ResellerBalance_Request>' +
      '</res:ResellerBalance>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>'
                var pr = {
                    url : 'http://arizonaadmin.mobifinng.com/WebService/iTopUp/reseller_itopup.server.php',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php#Reseller_iTopUp_wsdl#ResellerBalance'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                   console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                   
                  
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        if (err) {
                            reject(err)
                        } else {
                            //console.log(util.inspect(d, false, null));
                            var pre = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:ResellerBalanceResponse'][0]['ResellerBalance_Response'][0]['ResponseCode'][0]['_'];
                            var bal = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:ResellerBalanceResponse'][0]['ResellerBalance_Response'][0]['CurrentBalance'][0]['_'];
                            if (pre == '000') {
                                var r = {};
                                r.balance = parseInt(bal) / 100;
                                resolve(r)
                            } else {
				console.log(res);
                                reject();
                            }
                            /*
                            var pre = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:EchoCheckResponse'][0]['EchoCheck_Response'][0]['ResponseCode'][0]['_'];
                            if (pre == 000) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                            */
                        }
                    });
                    
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    req.end(payload);
        break;
        default:
            reject(new Error());
    }
   });
}
app.getMSISDNInfo = function (msisdn, api_id) {
    return new Promise(function (resolve, reject) {
        switch (api_id) {
            case "TRTO":

                console.log('TRTO_MSINFO ', msisdn);
                var k0 = new Date().getTime();
                var k1 = randomIntFromInterval(1000, 9999);
                var k2 = randomIntFromInterval(1000,9999);
                var key = String(k0 + k1 + k2);
            var url = process.env.TRTO_URL + '?login=' + process.env.TRTO_LOGIN + '&key=' + key + '&md5=' + md5(process.env.TRTO_LOGIN + process.env.TRTO_TOKEN + String(key)) + '&action=msisdn_info&destination_msisdn=' + msisdn;
                    var options = {
                        url: url,
                        strictSSL: false,
                        secureProtocol: 'TLSv1_method',
                            ciphers : 'ALL'
                    }
            console.log('TRTO_MSINFO', url);
            https(options, function (err, res, body) {

                if (!err && res.statusCode == 200) {
                    var obj = pp.parse(body);
                    console.log(obj);
                    if (obj.error_code == '0') {
                        resolve(obj);
                    } else {
                        reject(obj);
                    }
                } else {
                    reject(err);
                }
            })
            break;
            default:
                reject(new Error())
        }
    })
}
/*
 { transactionid: '523976445',
     msisdn: '447950442917',
     destination_msisdn: '447950442917',
     country: 'United Kingdom',
     countryid: '903',
     operator: 'T-Mobile PIN England',
     operatorid: '1755',
     reference_operator: '',
     originating_currency: 'USD',
     destination_currency: 'GBP',
     product_requested: '5',
     actual_product_sent: '5',
     wholesale_price: '6.83',
     retail_price: '8.60',
     balance: '2018.28',
     sms_sent: 'no',
     sms: '',
     cid1: '',
     cid2: '',
     cid3: '',
     pin_based: 'yes',
     pin_option_1: 'T-Mobile Recharge 5 pounds',
     pin_option_2: 'To recharge your phone, please dial 150, select option 1 then 2 and enter your pin no. followed by #.',
     pin_option_3: '',
     pin_value: '5',
     pin_code: '1553 7768 8350 4999 Text VO plus the 16digit code to 150 toredeem your voucherVoucher expires 1 mont',
     pin_ivr: '150',
     pin_serial: '',
     '2666000000103400': '',
     pin_validity: '365 days',
     authentication_key: '1485517895153',
     error_code: '0',
     error_txt: 'Transaction successful' } }



      pin_based: 'yes',
     pin_option_1: 'T-Mobile Recharge 5 pounds',
     pin_option_2: 'To recharge your phone, please dial 150, select option 1 then 2 and enter your pin no. followed by #.',
     pin_option_3: '',
     pin_value: '5',
     pin_code: '1553 5328 8386 6692 Text VO plus the 16digit code to 150 toredeem your voucherVoucher expires 1 mont',
     pin_ivr: '150',
     pin_serial: '',
     '2666000000103693': '',
     pin_validity: '365 days',


     */
app.topup = function (api_id, obj) {
    return new Promise(function (resolve, reject) {
        switch (api_id) {
            case "TRTO":
                console.log('TRTO_TOPUP', obj.msisdn);
                //var key = obj.reference
                 var k0 = new Date().getTime();
                var k1 = randomIntFromInterval(1000, 9999);
                var k2 = randomIntFromInterval(1000,9999);
                var key = String(k0 + k1 + k2);
		var url = process.env.TRTO_URL + '?login=' + process.env.TRTO_LOGIN + '&key=' + key + '&md5=' + md5(process.env.TRTO_LOGIN + process.env.TRTO_TOKEN + String(key)) + '&action='+ process.env.TRTO_MODE + '&destination_msisdn=' + obj.msisdn + '&msisdn=' + obj.msisdn + '&product=' + obj.denomination + '&send_sms=no';
                    https(url, function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    var robj = pp.parse(body);
                    console.log(robj);
                    if (robj.error_code == '0') {
                        var r = {};
                        r.success = true;
                        r.resp_debug = JSON.stringify(robj)
                        r.req_debug = String(url);
                        if (typeof robj.pin_based !== undefined) {
                            if (robj.pin_based == 'yes') {
                                r.pin_based = true;
                                r.pin_option1 = robj.pin_option_1;
                                r.pin_option2 = robj.pin_option_2;
                                r.pin_option3 = robj.pin_option_3;
                                r.pin_value = robj.pin_value;
                                r.pin_code = robj.pin_code;
                                r.pin_ivr = robj.pin_ivr;
                                r.pin_serial = robj.pin_serial;
                                r.pin_validity = robj.pin_validity;
                            } else {
                                 r.pin_based = false;
                            }
                        } else {
                            r.pin_based = false;
                        }
                        resolve(r);
                    } else {
                        var r = {};
                        r.success = false;
                        r.pin_based = false;
                        r.resp_debug = JSON.stringify(robj);
                        r.req_debug = String(url);
                        switch (robj.error_code) {
                            case "101":
                                r.responseCode = "MSISDN_INVALID"
                            break;
                            case "204":
                                r.responseCode = "MSISDN_NOT_PREPAID"
                            break;
                            case "301":
                                r.responseCode = "UNSUPPORTED_DENOMINATION"
                            break;
                            case "222":
                                r.responseCode = "MSISDN_BARRED"
                            break;
                            case "214":
                                r.responseCode = "OPERATOR_ERROR"
                            break;
                            default:
                                r.responseCode = "XYU"
                            break;
                        }
                        resolve(r)
                    }
                } else {
                    reject(err);
                }
            })
            break;
            case "TRLO":
                console.log('TRLO_TOPUP');
                  var k0 = new Date().getTime();
                var k1 = randomIntFromInterval(1000, 9999);
                var k2 = randomIntFromInterval(1000,9999);
                var key = String(k0 + k1 + k2);
                 //DealerTransactionID + SourceNo + DestNo + OperatorCode + Denomination + Credentials.UID + Security Key
                 var concat = obj.reference + obj.msisdn + obj.msisdn  + obj.denomination.toFixed(2) + process.env.TRLO_LOGIN + process.env.TRLO_KEY;
                var sign = md5(concat);
                console.log('SIGN', concat, sign)
            var soapHeader = '';
           var payload = '<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tem=\"http://tempuri.org/\" xmlns:tran=\"http://schemas.datacontract.org/2004/07/Tranglo20.Business.Processor\" xmlns:tran1=\"http://schemas.datacontract.org/2004/07/Tranglo20.Common.Entity\">'+
            '<soapenv:Header/>'+
            '<soapenv:Body>' +
                '<tem:Request_ReloadSync>' +
                    '<tem:epinReq>' +
                        '<tran:DealerTransactionId>' + obj.reference + '</tran:DealerTransactionId>' + 
                        '<tran:SourceNo>' + obj.msisdn + '</tran:SourceNo>' +
                        '<tran:DestNo>' + obj.msisdn + '</tran:DestNo>' + 
                        '<tran:OperatorCode></tran:OperatorCode>' +
                        '<tran:Denomination>' + obj.denomination.toFixed(2) + '</tran:Denomination>' +
                        '<tran:ByAmount>false</tran:ByAmount>' + 
                        '<tran:Credentials>' +
                        '<tran1:UID>' + process.env.TRLO_LOGIN + '</tran1:UID>' +
                        '<tran1:PWD>' + process.env.TRLO_PASS + '</tran1:PWD>' +
                        '<tran1:Signature>' + sign + '</tran1:Signature>' + 
                        '</tran:Credentials>' + 
                    '</tem:epinReq>' + 
                '</tem:Request_ReloadSync>' + 
            '</soapenv:Body>' + 
            '</soapenv:Envelope>'
                var pr = {
                    url : 'https://52.76.149.97:9001/API/GloReload.svc/soap',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://tempuri.org/IGloTransfer/Request_ReloadSync'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                   console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                    //var json = xml2json.toJson(res.body);
                    //console.log('json', json["s:Envelope"]["s:Body"]["EWallet_EnquiryResponse"]["EWallet_EnquiryResult"]["a:LastBalance"])

                    
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        console.log(util.inspect(d, false, null))
                        var ss = d['s:Envelope']['s:Body'][0]['Request_ReloadSyncResponse'][0]['Request_ReloadSyncResult'][0]['a:Status'][0]['b:Code'][0];
                        console.log('sta', ss)
                        if (err) {
                            reject(err)
                        } else {
                            if (ss == '000' || ss == '968') {
                                //ok
                                var r = {};
                                r.success = true;
                                r.resp_debug = res.body;
                                r.req_debug = payload;
                                 r.pin_based = false;
                                resolve(r)
                            } else {
                                console.log('resolving with err')
                                var r = {};
                                r.success = false;
                                r.responseCode = "OPERATOR_FAILURE";
                                r.resp_debug = res.body;
                                r.req_debug = payload;
                                r.pin_based = false;
                                resolve(r)
                            }
                        }
                        /*
                        if (err) {
                            reject(err)
                        } else {
                            var pre = d['s:Envelope']['s:Body'][0]['PingResponse'][0]['PingResult'][0];
                            if (pre == 1) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                        }
                        */
                    });
                    
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    req.end(payload);
            break;
            case "ETRX":
            console.log('ETRX_TOPUP')
             var k0 = new Date().getTime();
                var k1 = randomIntFromInterval(1000, 9999);
                var k2 = randomIntFromInterval(1000,9999);
                var key = String(k0 + k1 + k2);
            var soapHeader = '';
            soap.createClient(process.env.ETRX_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        request : {
                            terminalId : process.env.ETRX_USER,
                        action : 'VT',
                        transaction : {
                            pin : process.env.ETRX_PASS,
                            reference : key,
                            destination : obj.msisdn,
                            lineType : 'VTU',
                            senderName : '',
                            address : '',
                            provider : obj.operatorId,
                            amount : obj.denomination
                        }
                        }
                        
                    }
           		console.log('ETRX_REQ', args); 
                    cl.process(args, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                           if (res.response.error == '0') {
                               var r = {};
                               r.success = true;
                               r.resp_debug = JSON.stringify(res);
                               r.req_debug = JSON.stringify(args);
                               r.pin_based = false;
                               resolve(r)
                           } else {
                               var r = {};
                               r.success = false;
                               r.resp_debug = JSON.stringify(res);
                               r.req_debug = JSON.stringify(args);
                               r.responseCode = "OPERATOR_FAILURE"
                               r.pin_based = false;
                               resolve(r)
                           }
                        }
                    })
                }
            });
            break;
            case "SSLW":
            console.log('SSLW_TOPUP')
             var k0 = new Date().getTime();
                var k1 = randomIntFromInterval(1000, 9999);
                var k2 = randomIntFromInterval(1000,9999);
                var key = String(k0 + k1 + k2);
            var soapHeader = '';
            soap.createClient(process.env.SSLW_URL, function(err, cl) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    cl.addSoapHeader(soapHeader);
                    var args = {
                        client_id : process.env.SSLW_USER,
                        msisdn : obj.msisdn
                        }
                        
                    
            
                    cl.VerifyMSISDN(args, function (err, res) {
                        console.log('SSLW_VRFY_TOPUP')
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            if (res.result.$value == '1') {
                                var args2 = {
                                    client_id : process.env.SSLW_USER,
                                    client_pass : process.env.SSLW_PASS,
                                    recipient_msisdn : obj.msisdn,
                                    guid : md5(obj.reference).substring(0,25),
                                    operator_id : obj.operatorId,
                                    amount : obj.denomination,
                                    connection_type : 'postpaid'
                                }
                                cl.CreateRecharge(args2, function (err, r2) {
                                    console.log('SSLW_CRT_TOPUP', args2)
                                    if (err) {
                                        console.log(err);
                                        reject(err);
                                    } else {
                                       console.log(util.inspect(r2, false, null))
                                        if (r2.recharge_response.recharge_status.$value == '100') {
                                            var vrg = r2.recharge_response.vr_guid.$value;
                                            var args3 = {
                                                client_id : process.env.SSLW_USER,
                                                client_pass : process.env.SSLW_PASS,
                                                guid : md5(obj.reference).substring(0,25),
                                                vr_guid : vrg
                                            }
                                            cl.InitRecharge(args3, function (err, r3) {
                                                console.log('SSLW_NTT_TOPUP', args3)
                                                if (err) {
                                                    console.log(err);
                                                    reject(err);
                                                } else {
                                                       console.log(util.inspect(r3, false, null))
                                                       if (r3.recharge_response.recharge_status.$value == '200' || r3.recharge_response.recharge_status.$value == '201' || r3.recharge_response.recharge_status.$value == '202' || r3.recharge_response.recharge_status.$value == '900') {
                                                           var re = {};
                                                           re.success = true;
                                                           re.pin_based = false;
                                                           re.resp_debug = JSON.stringify(r3);
                                                           re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                                           resolve(re)
                                                       } else {
                                                           var re = {};
                                                            re.success = false;
                                                            re.pin_based = false;
                                                            re.resp_debug = JSON.stringify(r3);
                                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                                            re.responseCode = "OPERATOR_ERROR"
                                                            resolve(re)
                                                       }
                                                }
                                            })

                                        } else if (r2.recharge_response.recharge_status.$value == '304') {
                                            var re = {};
                                            re.success = false;
                                            re.pin_based = false;
                                            re.resp_debug = JSON.stringify(r2);
                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                            re.responseCode = "UNSUPPORTED_DENOMINATION"
                                            resolve(re)
                                        } else if (r2.recharge_response.recharge_status.$value == '305') {
                                                var re = {};
                                            re.success = false;
                                            re.pin_based = false;
                                            re.resp_debug = JSON.stringify(r2);
                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                            re.responseCode = "MSISDN_BARRED"
                                            resolve(re)
                                        } else if (r2.recharge_response.recharge_status.$value == '303') {
                                            var re = {};
                                            re.success = false;
                                            re.pin_based = false;
                                            re.resp_debug = JSON.stringify(r2);
                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                            re.responseCode = "MSISDN_NOT_PREPAID"
                                            resolve(re)
                                        } else if (r2.recharge_response.recharge_status.$value == '302') {
                                            var re = {};
                                            re.success = false;
                                            re.pin_based = false;
                                            re.resp_debug = JSON.stringify(r2);
                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                            re.responseCode = "MSISDN_INVALID"
                                            resolve(re)
                                        } else {
                                                var re = {};
                                            re.success = false;
                                            re.pin_based = false;
                                            re.resp_debug = JSON.stringify(r2);
                                            re.req_debug = String(JSON.stringify(args) + "\n" + JSON.stringify(args2) + "\n" + JSON.stringify(args3))
                                            re.responseCode = "OPERATOR_ERROR"
                                            resolve(re)
                                        }
                                            
                                    }
                                })
                            } else {
                                var re = {};
                                re.success = false;
                                re.pin_based = false;
                                re.resp_debug = JSON.stringify(res);
                                re.req_debug = String(JSON.stringify(args))
                                re.responseCode = "MSISDN_INVALID"
                                resolve(re)
                            }
                            /*
                            console.log()
                            var re = {};
                            re.success = false;
                            re.responseCode = "OPERATOR_FAILURE"
                            resolve(re);
                            */
                        }
                    })
                }
            });
            break;
            case "MFIN":
            console.log('MFIN_TOPUP', obj.msisdn);
        
             var key = new Date().getTime();
             var key2 = randomIntFromInterval(000, 999);
             var k3 = String(key) + String(key2);
		var den = parseInt(obj.denomination) * 100;
             console.log(key, key2)
                 console.log('K3', k3.substring(0,15))
            var d1 = new Date();
            var d2 = d1.getFullYear() + '-' + parseInt(d1.getMonth()+1) + '-' + d1.getDate()
        var c1 = process.env.MFIN_LOGIN + '|' + k3.substring(0,15) + '|' + obj.operatorId + '|' + '2' + '|' + obj.msisdn + '|' + den + '|' + obj.msisdn + '|' + 'support@primeairtime.com' +'|' + process.env.MFIN_PASS;
        var c2 = md5(sha1(c1));
        var payload = '<soapenv:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:res=\"http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php\">' +
   '<soapenv:Header/>'+
   '<soapenv:Body>'+
      '<res:FlexiRecharge soapenv:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">' +
         '<FlexiRecharge_Request xsi:type=\"xsd1:FlexiRecharge_Request\" xmlns:xsd1=\"http://soapinterop.org/xsd\">' +
     '<LoginId xsi:type=\"xsd:string\">' + process.env.MFIN_LOGIN + '</LoginId>' +
        '<RequestId>' + k3.substring(0,15) + '</RequestId>' +
        '<BatchId>' + obj.operatorId + '</BatchId>' +
        '<SystemServiceID>2</SystemServiceID>' +
        '<ReferalNumber>' + obj.msisdn + '</ReferalNumber>' +
        '<Amount>' + den + '</Amount>'+ 
        '<FromANI>' + obj.msisdn + '</FromANI>' + 
        '<Email>support@primeairtime.com</Email>' +
                    '<Checksum xsi:type=\"xsd:string\">' + c2 + '</Checksum>' +
         '</FlexiRecharge_Request>' +
      '</res:FlexiRecharge>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>'
                var pr = {
                    url : 'http://arizonaadmin.mobifinng.com/WebService/iTopUp/reseller_itopup.server.php',
                    headers : {
                        'Content-Type' : 'text/xml; charset=utf-8',
                        'SOAPAction' : 'http://arizonaadmin.mobifinng.com/WebService/reseller_iTopUp/reseller_iTopUp.wsdl.php#Reseller_iTopUp_wsdl#FlexiRecharge'
                    }
                
                }
                var buffer = "";
               var req = https.post(pr, function (err, res, body) {
                 //  console.log('statusCode', res.statusCode );
                    var buffer = "";
                    res.on( "data", function( data ) { buffer = buffer + data; } );
                    res.on( "end", function( data ) { console.log( buffer ); } );
                   
                  
                    var parser = new xml2js.Parser();
                    parser.parseString(res.body, function (err, d) {
                        if (err) {
                            reject(err)
                        } else {
                           // console.log(util.inspect(d, false, null));
                           var pre = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:FlexiRechargeResponse'][0]['FlexiRecharge_Response'][0]['ResponseCode'][0]['_'];
                           if (pre == '000') {
                               var re = {};
                               re.success = true;
                               re.pin_based = false;
                               re.resp_debug = res.body;
                               re.req_debug = payload;
                               resolve(re)
                           } else {
                               var re = {};
                               re.success = false;
                               re.pin_based = false;
                               re.resp_debug = res.body;
                               re.req_debug = payload;
                               switch (pre) {
                                   case "011":
                                    re.responseCode = "MSISDN_INVALID";
                                    break;
                                    case "014":
                                        re.responseCode = "UNSUPPORTED_DENOMINATION";
                                    break;
                                    case "021":
                                        re.responseCode = "MSISDN_INVALID";
                                    case "045":
                                        re.responseCode = "MSISDN_INVALID";
                                    case "042":
                                        re.responseCode = "OPERATOR_FAILURE";
                                    break;
                                    default:
                                        re.responseCode = "OPERATOR_ERROR"
                                    break;
                               }
                               resolve(re);
                           }
                            /*
                            if (pre == '000') {
                                var r = {};
                                r.balance = bal;
                                resolve(r)
                            } else {
                                reject();
                            }
                            */
                            /*
                            var pre = d['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns4:EchoCheckResponse'][0]['EchoCheck_Response'][0]['ResponseCode'][0]['_'];
                            if (pre == 000) {
                                resolve(pre)
                            } else {
                                reject();
                            }
                            */
                        }
                    });
                    
                                });
                    req.on('error', function(e) {
                        console.log('problem with request: ' + e.message);
                    });
                    req.end(payload);
            break;
            default:
                reject(new Error('default'))
            break;
        }
    })
}
module.exports = app;
