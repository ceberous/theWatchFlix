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

	var episodeName = $('span.list-top').text();
	episodeName = episodeName.split(" - ")[1];
	//console.log("Episode Name = " + episodeName);
	results.push(episodeName);

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

	
	var start , start2 , end;
	start = body.indexOf( "player_code" );
	start2 = body.indexOf( "file:" , start );
	end = body.indexOf( "v.mp4"  , start );
	var mp4URL = body.substring( start2 + 7 , end + 5 );
	
	/*
	var $ = cheerio.load(body);
	var $linkSearch = $("#player_code");
	$linkSearch.add($linkSearch.find('*'));
	$linkSearch.each( function( i , e ) {
		//console.log( $(e).attr("title") + " = " + $(e).attr("href") );
		console.log( $(e) );
	});
	*/

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

	setTimeout(function(){
		console.log("waiting on vodlocker countdown ....");

		// console.log( "		FOUND HASH: " + hash );
		request.post( { url: searchURL , form: { op: "download1" , id: id , hash: hash , imhuman: "Proceed to video" } } , function( error , response , rBody ) {

			if ( !error && response.statusCode === 200 ) {
				if (rBody) {
					parseForVodlockerMP4( res , rBody );
				}
			}
			else {
				if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
			}		

		});

	}, 1500 );

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


module.exports.search = function( req , res ) {

	// req.params.searchString

	// http://thewatchseries.to/show/search-shows-json
	// POST | x-www-form-urlencoded
	// term: req.params.searchString

	var searchURL = "http://thewatchseries.to/show/search-shows-json";
	//console.log("Searching: " + req.params.searchString);
	request.post( { url: searchURL , form: { term: req.params.searchString } } , function( error , response , body ) {

		if ( !error && response.statusCode === 200 ) {
			if (body) {
				sendJSONResponse( res , 200 ,  body );
			}
		}
		else {
			if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
		}		

	});	


};