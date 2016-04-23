var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var https = require('https');
var fs = require('fs');

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

// ==================================module.exports.searchTVShowEpisoddeForProviders======================================================================
	var parseForProviders = function( res , body ) {

		var results = [];

		var vodlocker = [];
		var gorillavid = [];

		var blankOBJ = {
			provider: "null",
			url: "http://null.mp4"
		};

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
			
			if ( p === "vodlocker.com" ) {
				var obj = {
					provider: p,
					url: $(e).attr("href")
				};				
				vodlocker.push(obj);
			}
			else if ( p === "gorillavid.in" ) {
				var obj = {
					provider: p,
					url: $(e).attr("href")
				};				
				gorillavid.push(obj);
			}

		});

		if ( vodlocker.length > 0 && gorillavid.length > 0 ) {
			// setup gorrilavid as second provider
			var g = gorillavid.pop();
			var v = vodlocker.pop();

			results = results.concat(gorillavid);
			results = results.concat(vodlocker);
			results.push( g );
			results.push( v );

			console.log("		Debug(found 1 of each)");
			console.log( results[results.length - 2].url + " | " + results[results.length - 1].url );

		}
		else if ( vodlocker.length > 0 && gorillavid.length < 0 ) {
			results = results.concat(vodlocker);
		}
		else if ( vodlocker.length < 0 && gorillavid.length > 0 ) {
			results = results.concat(gorillavid);
		}
		else if ( vodlocker.length < 0 && gorillavid.length < 0 ) {
			console.log("no parsable providers");
			resutls.push(blankOBJ);
			resutls.push(blankOBJ);
		}

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
// ==================================module.exports.searchTVShowEpisoddeForProviders======================================================================


// ==================================module.exports.searchProvider========================================================================================
	
	//==================================Vodlocker.com====================================================
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
	//==================================Vodlocker.com====================================================

	//==================================Gorrillavid.in====================================================

		var parseGorrilaVid = function( res , body ) {

			//console.log(body);

			var start , end , result;
			start = body.indexOf( "file:" );
			end = body.indexOf( "video.flv" , start );
			result = body.substring( start + 7 , end + 9 );

			if (result.length < 100) {
				sendJSONResponse( res , 200 , result );
			}
			else{
				//console.log(result);
				sendJSONResponse( res , 200 , "gorrillavid obfuscated the url" );	
			}


		};

		var searchGorillavid = function( res , id ) {

			var searchURL = "http://gorillavid.in/" + id;
			console.log( "Searching: " + searchURL );

			request.post( { url: searchURL , form: { op: "download1" , id: id , method_free: "Free Download" } } , function( error , response , body ) {

				if ( !error && response.statusCode === 200 ) {
					if (body) {
						parseGorrilaVid( res , body );
					}
				}
				else {
					if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
				}		

			});	

		};

	//==================================Gorrillavid.in====================================================

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
// ==================================module.exports.searchProvider========================================================================================


// theWatchTVSeries.to/search
// ==================================module.exports.search===============================================
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
// ==================================module.exports.search===============================================


// ==================================module.exports.loadLatestEpisodes===================================
	var parseLatestResults = function( res , latestResults  ) {

		var actualResults = [];

		for ( var i = 0; i < latestResults.length; ++i ) {

			var $ = cheerio.load(latestResults[i]);

			var $linkSearch = $(".listings a").has("span");
			$linkSearch.add($linkSearch.find('*'));
			$linkSearch.each( function( i , e ) {
				
				var cache = $(e);
				var date = cache.children()[0].children[0]["data"];
				if ( date.length > 9 ) {
					var link = cache.attr("href");
					link = link.split("/episode/")[1];
					link = link.split(".html")[0];
					//console.log(link);
					link = link.split("_");
					var episode = link.pop();
					episode = episode.substring( 1 , episode.length ); // remove "e"
					var season = link.pop();
					season = season.substring( 1 , season.length ); // remove "s"
					var showID = link.join("_");
					var obj = {
						showID: showID,
						seasonNumber: season,
						episodeNumber: episode,
						date: date
					};	
					//console.log( obj.showID + " | S: " + obj.seasonNumber + " | E: " + obj.episodeNumber + " | Date: " obj.date );
					actualResults.push( obj );

				}

			});

		}

		sendJSONResponse( res , 200 , actualResults );

	};

	var loadLatestURL = "http://thewatchseries.to/latest/";
	var latestIndex = 1;
	var latestResults = [];
	var loadLatestHelper = function( res ) {

		if ( latestIndex < 6 ) {
			
			var x = loadLatestURL + latestIndex;
			console.log("Grabbing: " + x);
			request( x , function( error , response , body ) {

				if ( !error && response.statusCode === 200 ) {
					if (body) {
						latestIndex += 1;
						latestResults.push(body);
						loadLatestHelper( res );
					}
				}
				else {
					if ( error ) { console.log( error ); sendJSONResponse( res , 404 , null ); }
				}			

			});		
			
		}
		else {

			parseLatestResults( res , latestResults );

		}


	};

	module.exports.loadLatestEpisodes = function( req , res ) {

		latestResults = [];
		latestIndex = 1;
		loadLatestHelper( res );

	};
// ==================================module.exports.loadLatestEpisodes===================================



