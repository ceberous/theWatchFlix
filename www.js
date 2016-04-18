var app = require('./app');
var port = process.env.PORT || 3000;

app.set( 'port' , port );

	var server = app.listen( app.get('port') , function() {
	console.log("Starting theWatchFlixApp .......");
	console.log( "ready @ http://localhost:" + port );

});