(function(){

	homeCtrl.$inject = ['$http' , '$sce'];

	function homeCtrl( $http , $sce ) {


		var vm = this;

		var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

		// Temporaries
		var recievedMP4URLS = [];

		// Store Destination Flags
		var storeFullSweep = false;
		var storeCurrent = false;
		var storeFuture = false;
		var storePrevious = false;
		var storeRandom = false;
		var storeRandomFuture = false;

		vm.displayVideo = false;
		vm.showTVShowLinks = false;
		vm.IS_SHUFFLE = false;

		vm.CURRENT_SHOW = {};
		vm.CURRENT_SHOW.seasons = [];

		vm.CURRENT_SHOW.randomlyGrabbedLinks = [];
		vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];

		vm.CURRENT_SHOW.showID;
		vm.tvURL = "south_park";


		vm.clickOnTVLink = function(link) {
			storeCurrent = true;
			searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , link.season , link.number );
		};

		var getMP4URLS = function( data ) {

			if ( recievedMP4URLS.length < 2 ) {

				var x = data.pop();
				x.provider = x.provider.split(".")[0];
				x.url = x.url.split("/")[3];
				
				console.log( "$http.put( /api/searchProvider/:" + x.provider + "/:" + x.url + " )" );
				$http.put( '/api/searchProvider/' + x.provider + "/" + x.url )
					.error(function(e){
						console.log(e);
					})
					.success(function(rData){
						recievedMP4URLS.push( rData );
						getMP4URLS( data );
					})
				;

			}
			else {
				console.log( recievedMP4URLS[0] );
				console.log( recievedMP4URLS[1] );
			}

		};

		var searchTVShowEpisodeForProviders = function( showID , seasonNumber , episodeNumber ) {

			var providers = [];

			console.log( "$http.put( /api/searchTVShowEpisodeForProviders/:" + showID + "/:" + seasonNumber + "/:" + episodeNumber +" )" );
			$http.put( '/api/searchTVShowEpisodeForProviders/' + showID + "/" + seasonNumber + "/" + episodeNumber )
				.error(function(e){
					console.log(e);
				})
				.success(function(data){

					// Decode HashedURL's
					for ( var i = 0; i < data.length; ++i ) {
						data[i].url = Base64.decode( data[i].url.split("=")[1] );
						//console.log(data[i].url);
					}
					recievedMP4URLS = [];
					getMP4URLS( data );

				})
			;

		};

		vm.searchTVShow = function() {
			// vm.tvURL = "south_park";
			searchTVShowHelper( vm.tvURL );
		};


		var searchTVShowHelper = function( showID ) {

			vm.CURRENT_SHOW.showID = showID;
			console.log("$http.put( /api/searchTVShow/:" + showID +" )" );

			$http.put( '/api/searchTVShow/' + showID )
				.error(function(e){
					console.log(e);
				})
				.success(function(data){
					displayTVShowSeasons(data);
				})
			;

		};

		var displayTVShowSeasons = function( tvShowRawHTML ) {

			var haystack = tvShowRawHTML.trim();

			var needle = 'content="/episode/';
			var re = new RegExp( needle , 'gi' );

			var sC = 1;
			var currentSeason = 0;
			var results = new Array();
			var blankArray = [];
			results.push(blankArray);


			while ( re.exec( haystack ) ) {

				var linkName = haystack.indexOf( "itemprop=\"name\">Episode" , re.lastIndex );
				var begin = haystack.indexOf( "&nbsp;" , linkName );
				var end = haystack.indexOf( "</span>" , linkName );

				linkName = haystack.substring( begin , end );
				linkName = linkName.split("&nbsp;")[3].trim();
				
				linkName = ( linkName === '\' + shortName + \'' ) ? "unknown" : linkName;
				linkName = linkName.replace( /(&#039;)/g , '\'' ); // replace for apostrophe 
				linkName = linkName.replace( /(&amp;)/g , '&' ); // replace for & 

				var tmp = haystack.substring( re.lastIndex , ( re.lastIndex + vm.CURRENT_SHOW.showID.length + 9 ) );
				tmp = tmp.split(".")[0];
				tmp = tmp.split("_");

				var e = tmp.pop();
				var s = tmp.pop();
				e = parseInt(e.slice( 1 , e.length ));
				s = parseInt(s.slice( 1 , s.length ));

				// console.log( "S: " + s + "E: " + e + " : " + linkName );

				var episode = {
					season: s,
					number: e,
					name: linkName
				};

				if ( currentSeason === 0 ) {
					currentSeason = s;
				}

				if ( currentSeason === s ) {
					results[ sC - 1 ].push(episode);
				}
				else {
					sC += 1;
					currentSeason = s;
					var blankArray = [];
					results.push(blankArray);
					results[ sC - 1 ].push(episode);
				}

			}

			vm.CURRENT_SHOW.seasons = results;
			vm.CURRENT_SHOW.totalSeasons = results.length;
			vm.showTVShowLinks = true;

		};


	}


	angular
		.module('theWatchFlixApp')
		.controller('homeCtrl' , homeCtrl)
	;


})();