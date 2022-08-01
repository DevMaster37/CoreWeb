var app = {};
app.checkReadAccess = function (req, res, next) {
   next();
}
app.checkWriteAccess = function (req, res, next) {
    next();
}
module.exports = app;