var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routesAPI = require( './app_api/routes/index' );

var app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.all('/' , function(req , res , next){
    res.sendFile('index.html' , { root: __dirname });
});

app.use('/api' , routesAPI);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    req.connection.setTimeout( 50000 );
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    //res.render('error', {
        //message: err.message,
        //error: {}
    //});
	console.log(req.url + " = " + err );

});

module.exports = app;