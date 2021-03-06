var request = require('request');
var unirest = require('unirest');
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
		var videome = [];

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
			}/*
			else if ( p == "thevideo.me" ) {
				var obj = {
					provider: p,
					url: $(e).attr("href")
				};
				videome.push(obj);
			}
			*/

		});

		if ( vodlocker.length > 0 && gorillavid.length > 0 ) {
			// setup gorrilavid as second provider
			var g = gorillavid.pop();
			var v = vodlocker.pop();

			results = results.concat(vodlocker);
			results = results.concat(gorillavid);
			results.push( v );
			results.push( g );

			console.log("		Debug(found 1 of each)");
			console.log( results[results.length - 2].url + " | " + results[results.length - 1].url );
			/*
			if ( videome.length > 0 ) {
				console.log("		Debug-TESTING( ... adding videome[0] to results[0]  ");
				results.push(videome[0]);
			}
			*/

		}
		else if ( vodlocker.length > 0 && gorillavid.length <= 0 ) {
			console.log("		Debug(only found vodlocker)")
			results = results.concat(vodlocker);

			if ( videome.length > 0 ) {
				console.log("		Debug-TESTING( ... adding videome[0] to results[0]  ");
				results.push(videome[0]);
			}


		}
		else if ( vodlocker.length <= 0 && gorillavid.length > 0 ) {
			console.log("		Debug(only found gorillavid)");
			results = results.concat(gorillavid);

			if ( videome.length > 0 ) {
				console.log("		Debug-TESTING( ... adding videome[0] to results[0]  ");
				results.push(videome[0]);
			}


		}
		else if ( vodlocker.length <= 0 && gorillavid.length <= 0 ) {
			console.log("no parsable providers");
			results.push(blankOBJ);
			results.push(blankOBJ);
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

				end = body.indexOf( "video.mp4" , start );
				result = body.substring( start + 7 , end + 9 );

				sendJSONResponse( res , 200 , result );
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

	//==================================thevideo.me====================================================

		var searchTheVideo = function( res , id ) {

			var searchURL = "http://thevideo.me/" + "e2t4ef6tu2rr";
			console.log("Searching: " + searchURL );

			// request.cookie("cfduid=da540b3d4ec3f45243fb23355ff1c31d41457907928; lang=1; ref_url=thewatchseries.to%2Fcale.html%3Fr%3DaHR0cDovL3RoZXZpZGVvLm1lL3UwNmVjaW51NjY4Mg%3D%3D; file_id=3353736; aff=2889; __.popunderCap=4");

			// request.post( { url: searchURL , form: { _vhash: "i1102394cE" , gfk: "i22abd2449" ,  op: "download1" , id: id , hash: "3353736-206-214-1463536047-9abc0a7113aae91d689c91d479de74ac" , inhu: "foff" } } , function( error , response , body ) {

			var CookieJar = unirest.jar();
			CookieJar.add( '_cfduid=da540b3d4ec3f45243fb23355ff1c31d41457907928' , 'lang=1' , 'file_id=999490' , 'aff=124' , 'ref_url=http%3A%2F%2Fthewatchseries.to%2Fcale.html%3Fr%3DaHR0cDovL3RoZXZpZGVvLm1lL2UydDRlZjZ0dTJycg%3D%3D' , '__.popunderCap=5'  );

			unirest
				.post(searchURL)
				.jar(CookieJar)
				.headers({
					'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'Origin' : 'http://thevideo.me',
					'X-DevTools-Emulate-Network-Conditions-Client-Id': '45BFC8EA-1E6F-43A7-8FA2-C91E8BE766CC',
					'Upgrade-Insecure-Requests': '1',
					'Content-Type' : 'application/x-www-form-urlencoded',
					'Referer': 'http://thevideo.me/e2t4ef6tu2rr',
					'Accept-Encoding': 'gzip, deflate',
					'Accept-Language': 'en-GB,en-US;q=0.8,en;q=0.6'
				})
				.send({
					"_vhash": "i1102394cE",
					"fname": "silicon.valley.s01e07.hdtv.x264.killers.mp4",
					"gfk": "i1102394cE",
					"hash": "999490-206-214-1463547270-7913085cc5f7d3748e3bc7530a7c1875",
					"id": "e2t4ef6tu2rr",
					"imhuman": "",
					"inhu": "foff",
					"op": "download1",
					"referer": "http://thewatchseries.to/cale.html?r=aHR0cDovL3RoZXZpZGVvLm1lL2UydDRlZjZ0dTJycg==",
					"usr_login": ""
				})
				.end(function( xresponse ) {

					console.log(xresponse);
					console.log(xresponse[0]);

					fs.writeFile( "/home/sarah/Documents/PROGRAMMING/WEBSITES/TheWatchFlix/a.txt" , xresponse , function(e) {
						if (e) {console.log(e);}
					});

					sendJSONResponse( res , 200 , "blank" );

				});


			//sendJSONResponse( res , 200 , "blank" );

		};

	//==================================thevideo.me====================================================
	
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



