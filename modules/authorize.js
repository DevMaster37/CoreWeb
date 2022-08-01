/* 
* Authorize middleware
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : authorize.js
*/ 

var User = require('../models/admin');
var Accounts = require('../models/account');
var oid = require('mongoose').Types.ObjectId;

module.exports = function (req, res, next) {
    if ('undefined' !== typeof req.user) {
         User.findOne({_id : new oid(req.user.iss)}, {password : false}).exec()
         .then(function (user) {
             //Creating initial req.user object with necessary params
             req.user.username = user.username;
             req.user._id = user._id;
             req.user.first_name = user.first_name;
             req.user.last_name = user.last_name;
             req.user.email = user.email;
             if (typeof user.avatar !== 'undefined') {
                 req.user.avatar = user.avatar;
             }
             req.user.main_account = user.main_account;
             return Accounts.find({rwaccess : req.user._id}).exec();
         })
         .then(function (accounts) {
             //Populating RWacces
             req.user.rwaccess = [];
             req.user.child = [];
             accounts.forEach(function (obj) {
                 req.user.rwaccess.push(obj._id); 
             });
             return Accounts.find({parent : {$in : req.user.rwaccess}}).exec();
         })
         .then(function (accp) {
             //same for child objects
             var level2 = [];
             accp.forEach(function (oo) {
                 req.user.rwaccess.push(oo._id);
                 req.user.child.push(oo._id);
                 level2.push(oo._id);
             });
             return Accounts.find({parent : {$in : level2}}).exec();
         })
         .then(function (accl2) {
             //and one more time
             var level3 = [];
             accl2.forEach(function (oj) {
                 req.user.rwaccess.push(oj._id);
                 req.user.child.push(oj._id);
                 level3.push(oj._id);
             });
             return Accounts.find({parent : {$in : level3}}).exec();
             
         })
         .then (function (accl3) {
             //last time
             accl3.forEach(function (oy) {
                 req.user.rwaccess.push(oy._id);
                 req.user.child.push(oy._id);
             });
             return Accounts.find({roaccess : req.user._id}).exec();
         })
         .then(function (accro) {
             //populating ROaccess
             req.user.roaccess = [];
             accro.forEach(function (o) {
                 req.user.roaccess.push(o._id);
             });
             return Accounts.findOne({_id : req.user.main_account}).exec();
         })
         .then(function (mt) {
            req.user.account_type = mt.type;
            req.user.hasSystemAccess = mt.hasSystemAccess;
             return Accounts.find().exec();
         })
         .then(function (bcca) {
            req.user.rwnames = [];
            bcca.forEach(function (a) {
                req.user.rwnames[a._id] = a.account_name;
            })
            next();
         })
         .catch(function (error) {
             console.log(error);
             throw error;
         });
    } else {
        next();
    }
};