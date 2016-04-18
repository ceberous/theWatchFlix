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
	console.log( "Grabbing: " + searchURL );

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

var parseForProviders = function( res , body ) {

	var results = [];

	var $ = cheerio.load(body);
	var $linkSearch = $("#linktable a");
	$linkSearch.add($linkSearch.find('*'));
	$linkSearch.each( function( i , e ) {
		//console.log( $(e).attr("title") + " = " + $(e).attr("href") );
		var p = $(e).attr("title");
		p = ( p === undefined ) ? "null" : p.toString().trim();
		if ( 
			p === "vodlocker.com" /*|| 
			p === "gorillavid.in" ||
			p === "allmyvideos.net" ||
			p === "thevideo.me" */
		) {
			var obj = {
				provider: p,
				url: $(e).attr("href")
			};
			results.push(obj);
		}

	});

	sendJSONResponse( res , 200 , results );

};

module.exports.searchTVShowEpisodeForProviders = function( req , res ) {

	var searchURL = "http://thewatchseries.to/episode/" + req.params.showID + "_s" + req.params.season + "_e" + req.params.episode + ".html";
	console.log("Grabbing: " + searchURL );

	request( searchURL , function( error , response , body ) {

		if ( !error && response.statusCode === 200 ) {
			if (body) {
				parseForProviders( res , body );
			}
		}
		else {
			if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
		}		

	});

};


var parseForVodlockerMP4 = function( res , body ) { // needs undefined error checking like real bad

	var start , end;
	start = body.indexOf( "jwplayer(\"flvplayer\").setup({" );
	end = body.indexOf( "v.mp4"  , start );
	var mp4URL = body.substring( start + 6 , end + 5 );
	mp4URL = mp4URL.split("file:")[1];
	start = mp4URL.indexOf( "http:" );
	mp4URL = mp4URL.substring( start , mp4URL.length );

	sendJSONResponse( res , 200 , mp4URL );

};


var parseForVodlockerHash = function( res , body , id ) {

	var searchURL = "http://vodlocker.com/" + id;

	var start , end;
	start = body.indexOf( "name=\"hash\"" , 0 );
	end = body.indexOf( ">" , start );
	var hash = body.substring( start , end );
	hash = hash.split(" ")[1];
	hash = hash.split("\"")[1];

	console.log( "		FOUND HASH: " + hash );
	request.post( { url: searchURL , form: { op: "download1" , id: id , hash: hash } } , function( error , response , rBody ) {

		if ( !error && response.statusCode === 200 ) {
			if (rBody) {
				parseForVodlockerMP4( res , rBody );
			}
		}
		else {
			if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
		}		

	});


};


var searchVodlocker = function( res , id ) {

	var searchURL = "http://vodlocker.com/" + id;
	console.log( "Searching: " + searchURL );

	// need the stupid hash to post to vodlocker
	// x-www-form-urlencoded
	// op: download1,
	// id: id,
	// hash: ??????

	request( searchURL , function( error , response , body ) {

		if ( !error && response.statusCode === 200 ) {
			if (body) {
				parseForVodlockerHash( res , body , id );
			}
		}
		else {
			if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
		}			

	});

	

};

module.exports.searchProvider = function( req , res ) {

	var provider = req.params.provider;
	var id = req.params.url;

	switch ( provider ) {

		case "vodlocker":
			searchVodlocker( res , id );
			break;
		case "gorillavid":
			searchGorillavid( res , id );
			break;
		case "allmyvideos":
			searchAllmyvideos( res , id );
			break;
		case "thevideo":
			searchTheVideo( res , id );
			break;
		default:
			console.log("unknown provider");
			sendJSONResponse( res , 404 , null );
			break;

	}
	

};