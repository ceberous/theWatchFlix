(function(){

	homeCtrl.$inject = ['$http' , '$sce'];

	function homeCtrl( $http , $sce ) {


		var vm = this;

		var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

		// Temporaries
		vm.NOW_PLAYING = $sce.trustAsResourceUrl( "http://74.117.181.136:8777/w2cefo4f2k4pcnokaltsxy6n4i3bdvdma4q3pqrjiybbrlzgkyr2qpni6y/v.mp4" );
		var episode , season;
		var recievedMP4URLS = [];
		var grabbedEpisodeName;

		// Store Destination Flags
		var catchNullReturn = false;
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
		vm.CURRENT_SHOW.currentLinks = [];
		vm.CURRENT_SHOW.futureLinks = [];
		vm.CURRENT_SHOW.previousLinks = [];

		vm.CURRENT_SHOW.showID;
		vm.tvURL = "south_park";

		// Full Sweep Stuff
		vm.CURRENT_SHOW.currentEpisodeName;
		vm.CURRENT_SHOW.currentEpisodeNumber;
		vm.CURRENT_SHOW.currentSeasonNumber;
		vm.CURRENT_SHOW.futureEpisodeName;
		vm.CURRENT_SHOW.futureEpisodeNumber;
		vm.CURRENT_SHOW.futureSeasonNumber;
		vm.CURRENT_SHOW.previousEpisodeName;
		vm.CURRENT_SHOW.previousEpisodeNumber;
		vm.CURRENT_SHOW.previousSeasonNumber;

		// Random Name Stuff
		vm.CURRENT_SHOW.randomEpisodeName;
		vm.CURRENT_SHOW.randomEpisodeNumber;
		vm.CURRENT_SHOW.randomSeasonNumber;
		vm.CURRENT_SHOW.randomFutureEpisodeName;
		vm.CURRENT_SHOW.randomFutureEpisodeNumber;
		vm.CURRENT_SHOW.randomFutureSeasonNumber;

		// Video Player Config
		vm.nowPlayingEpisodeName;
		vm.nowPlayingEpisodeNumber;
		vm.nowPlayingSeasonNumber;

		vm.showRetryProviderButton = false;
		vm.showNextButton = false;
		vm.showPreviousButton = false;

		vm.toggleShuffle = function() {

			vm.IS_SHUFFLE = !vm.IS_SHUFFLE;

			// IF Button-Click Turned shuffle ON  
			if ( vm.IS_SHUFFLE ) {

				var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.randomlyGrabbedLinks[0] );

				vm.nowPlayingEpisodeName 	= vm.CURRENT_SHOW.randomEpisodeName;
				vm.nowPlayingEpisodeNumber  = vm.CURRENT_SHOW.randomEpisodeNumber;
				vm.nowPlayingSeasonNumber 	= vm.CURRENT_SHOW.randomSeasonNumber;

				vm.displayVideo = true;
				swapVideoSource( newURL );


				// GENERATE *NEXT* RANDOM episode and FETCH 
				var ranS , ranE;
				ranS = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons.length ) ) + 1;
				ranE = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length ) ) + 1;

				vm.CURRENT_SHOW.randomFutureEpisodeName = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length - ranE ].name;;
				vm.CURRENT_SHOW.randomFutureEpisodeNumber = ranE;
				vm.CURRENT_SHOW.randomFutureSeasonNumber = ranS;

				storeRandomFuture = true;
				recievedMP4URLS = [];
				searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , ranS , ranE );


			}
			else { // Button-Click Turned shuffle OFF

				// may need to perform some clean up,
				// not cleaning up for now on porpuse .

			}

		};

		var swapVideoSource = function( url ) {

			console.log("swapping source TO --> " + url );
			$('#removablePlayer').remove();
			setTimeout(function(){
				
				$("#videoPlayer").append("<div id=\"removablePlayer\"><video id=\"my-video2\" class=\"video-js\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{}\"><source src=\"" + url + "\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
				
				// ADD 
				// show retry provider button 
				// show NEXT Button if RANDOm
				// show NEXT and PREVIOUS button if FullSweep

			} , 2000 );

		};


		vm.clickOnTVLink = function(link) {

			vm.CURRENT_SHOW.currentLinks = [];
			vm.CURRENT_SHOW.futureLinks = [];
			vm.CURRENT_SHOW.previousLinks = [];

			console.log( "				Starting FullSweep" );
			storeFullSweep = true;
			storeCurrent = true;
			vm.CURRENT_SHOW.currentSeasonNumber = parseInt(link.season);
			vm.CURRENT_SHOW.currentEpisodeName = link.name;
			vm.CURRENT_SHOW.currentEpisodeNumber = parseInt(link.number);
			//console.log( vm.CURRENT_SHOW.currentEpisodeName + " =: S: " + vm.CURRENT_SHOW.currentSeasonNumber + " E: " + vm.CURRENT_SHOW.currentEpisodeNumber );
			searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , link.season , link.number );
		};

		var storeLinks = function() {



			if ( storeFullSweep ) {

				if ( storeCurrent ) {

					storeCurrent = false;
					//console.log("storing into vm.CURRENT_SHOW.currentlinks[]");
					vm.CURRENT_SHOW.currentLinks = recievedMP4URLS;
					storeFuture = true;

					// if episode name was previously unkown
					if ( vm.CURRENT_SHOW.currentEpisodeName === "unknown"  ) {
						vm.CURRENT_SHOW.currentEpisodeName = grabbedEpisodeName;
					} 

					
					// boundry checks for future / next episode
					// ===================================================================
						// if Next Episode is Outside of this Season
						if ( ( vm.CURRENT_SHOW.currentEpisodeNumber + 1 ) > vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - vm.CURRENT_SHOW.currentSeasonNumber ][0].number ) {

							// are we in the last season ?
							season = ( parseInt(vm.CURRENT_SHOW.currentSeasonNumber) === vm.CURRENT_SHOW.seasons.length ) ? 1 : vm.CURRENT_SHOW.currentSeasonNumber + 1 ;
							episode = 1;

						}
						else {
							season = vm.CURRENT_SHOW.currentSeasonNumber;
							episode = vm.CURRENT_SHOW.currentEpisodeNumber + 1;
						}
					// ===================================================================
					
					if ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ] != undefined ) {
						vm.CURRENT_SHOW.futureEpisodeName = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ].name;
					}
					else {
						vm.CURRENT_SHOW.futureEpisodeName = "unknown";
					}
					vm.CURRENT_SHOW.futureSeasonNumber = season;
					vm.CURRENT_SHOW.futureEpisodeNumber = episode;					

					searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , season , episode );

				}
				else if ( storeFuture ) {

					if ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ] != undefined ) {

											// if episode name was previously unkown
						if ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ].name === "unknown"  ) {
							vm.CURRENT_SHOW.futureEpisodeName = grabbedEpisodeName;
						} 

					}
					else {
						vm.CURRENT_SHOW.futureEpisodeName = grabbedEpisodeName;
					}



					storeFuture = false
					//console.log("storing into vm.CURRENT_SHOW.futureLinks[]");
					vm.CURRENT_SHOW.futureLinks = recievedMP4URLS;
					storePrevious = true;

					// boundry checks for previous episode
					// ===================================================================
						// 1st Episode in Season ? 
						if ( vm.CURRENT_SHOW.currentEpisodeNumber === 1 ) {

							// 1st Season ? , then set to last season
							if ( vm.CURRENT_SHOW.currentSeasonNumber === 1 ) {
								season = vm.CURRENT_SHOW.seasons.length;
								episode = vm.CURRENT_SHOW.seasons[ 0 ][ 0 ].number; 
							}
							else {
								season = vm.CURRENT_SHOW.currentSeasonNumber - 1;
								episode = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][0].number;								
							}

						}
						else {
							season = vm.CURRENT_SHOW.currentSeasonNumber;
							episode = vm.CURRENT_SHOW.currentEpisodeNumber - 1;
						}
					// ===================================================================


					if ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ] != undefined ) {
						vm.CURRENT_SHOW.previousEpisodeName = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ].name;
					}
					else {
						vm.CURRENT_SHOW.previousEpisodeName = "unknown";
					}

					vm.CURRENT_SHOW.previousSeasonNumber = season;
					vm.CURRENT_SHOW.previousEpisodeNumber = episode;	


					searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , season , episode );


				}
				else if ( storePrevious ) {

					if  ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ] != undefined ) {

						// if episode name was previously unkown
						if ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - season ].length - episode ].name === "unknown"  ) {
							vm.CURRENT_SHOW.previousEpisodeName = grabbedEpisodeName;
						} 						

					}
					else {
						vm.CURRENT_SHOW.previousEpisodeName = grabbedEpisodeName;
					}

					storePrevious = false;
					storeFullSweep = false;
					//console.log("storing into vm.CURRENT_SHOW.previousLinks[]");
					vm.CURRENT_SHOW.previousLinks = recievedMP4URLS;

					console.log( "				FullSweep Success!" );
					console.log("	CurrentLinks = " + vm.CURRENT_SHOW.currentEpisodeName + " S: " + vm.CURRENT_SHOW.currentSeasonNumber + " E: " + vm.CURRENT_SHOW.currentEpisodeNumber );
					console.log( vm.CURRENT_SHOW.currentLinks[0] );
					console.log( vm.CURRENT_SHOW.currentLinks[1] );
					console.log( "	FutureLinks =  " + vm.CURRENT_SHOW.futureEpisodeName + " S: " + vm.CURRENT_SHOW.futureSeasonNumber + " E: " + vm.CURRENT_SHOW.futureEpisodeNumber );
					console.log( vm.CURRENT_SHOW.futureLinks[0] );
					console.log( vm.CURRENT_SHOW.futureLinks[1] );
					console.log( "	PreviousLinks =  " + vm.CURRENT_SHOW.previousEpisodeName + " S: " + vm.CURRENT_SHOW.previousSeasonNumber + " E: " + vm.CURRENT_SHOW.previousEpisodeNumber );
					console.log( vm.CURRENT_SHOW.previousLinks[0] );
					console.log( vm.CURRENT_SHOW.previousLinks[1] );

				}

			}
			else if ( storeRandom ) {
				storeRandom = false;

				if ( !vm.showShuffleButton ) { vm.showShuffleButton = true; }

				vm.CURRENT_SHOW.randomEpisodeName = ( vm.CURRENT_SHOW.randomEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.randomEpisodeName;

				vm.CURRENT_SHOW.randomlyGrabbedLinks = recievedMP4URLS;
				console.log("Recieved Random Episode: " + vm.CURRENT_SHOW.randomEpisodeName + " S: " + vm.CURRENT_SHOW.randomSeasonNumber + " E: " + vm.CURRENT_SHOW.randomEpisodeNumber );
				console.log(vm.CURRENT_SHOW.randomlyGrabbedLinks[0]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedLinks[1]);
			}
			else if ( storeRandomFuture ) {

				storeRandomFuture = false;
				vm.CURRENT_SHOW.randomFutureEpisodeName = ( vm.CURRENT_SHOW.randomFutureEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.randomFutureEpisodeName;

				vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = recievedMP4URLS;
				console.log("Recieved *NEW* Random Episode: " + vm.CURRENT_SHOW.randomFutureEpisodeName + " S: " + vm.CURRENT_SHOW.randomFutureSeasonNumber + " E: " + vm.CURRENT_SHOW.randomFutureEpisodeNumber );
				console.log(vm.CURRENT_SHOW.randomlyGrabbedFutureLinks[0]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedFutureLinks[1]);

				vm.showNextButton = true;

			}

		};

		var getMP4URLS = function( data ) {

			if ( catchNullReturn ) {
				catchNullReturn = false;
				recievedMP4URLS = [ "null.mp4" , "null.mp4" ];
				storeLinks();

			}

			else if ( recievedMP4URLS.length < 2 ) {

				var x = data.pop();
				x.provider = x.provider.split(".")[0];
				x.url = x.url.split("/")[3];
				
				console.log( "$http.put( /api/searchProvider/:" + x.provider + "/:" + x.url + " )" );
				$http.put( '/api/searchProvider/' + x.provider + "/" + x.url )
					.error(function(e){
						console.log(e);
					})
					.success(function(rData){
						if ( rData != undefined && rData != " " && rData.length > 5 ) {
							recievedMP4URLS.push( rData );
						}
						getMP4URLS( data );
					})
				;

			}
			else { // Grab Bag is Empty , Fill Apropriatly

				storeLinks();

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

					if ( data[1] === undefined ) {
						grabbedEpisodeName = data[0];
						catchNullReturn = true;
						console.log("no links found");
						getMP4URLS( data );						
					}
					else {

						grabbedEpisodeName = data.shift();

						// Decode HashedURL's
						for ( var i = 0; i < data.length; ++i ) {
							data[i].url = Base64.decode( data[i].url.split("=")[1] );
							//console.log(data[i].url);
						}
						recievedMP4URLS = [];
						getMP4URLS( data );

					}

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
					console.log("about to parse episodes into seasons");
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

			// GENERATE RANDOM episode and FETCH 
			var ranS , ranE;
			ranS = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons.length ) ) + 1;
			ranE = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length ) ) + 1;

			vm.CURRENT_SHOW.randomEpisodeName = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length - ranE ].name;;
			vm.CURRENT_SHOW.randomEpisodeNumber = ranE;
			vm.CURRENT_SHOW.randomSeasonNumber = ranS;

			storeRandom = true;
			recievedMP4URLS = [];
			searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , ranS , ranE );

		};


	}


	angular
		.module('theWatchFlixApp')
		.controller('homeCtrl' , homeCtrl)
	;


})();