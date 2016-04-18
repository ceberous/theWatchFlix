var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var https = require('https');
var fs = require('fs');

// sendJSONResponse( res , 200 , body );
// sendJSONResponse( res , 404 , null );
var sendJSONResponse = function( res , status , content ) {
    if (status) {res.status(status);}
    res.json(content);
};



module.exports.searchTVShow = function( req , res ) {
	
	var searchURL = "http://thewatchseries.to/serie/" + req.params.showID;

	request( searchURL , function( error , response , body ) {

		if ( !error && response.statusCode === 200 ) {
			if (body) {
				sendJSONResponse( res , 200 , body );
			}
		}
		else {
			if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
		}

	});

};

