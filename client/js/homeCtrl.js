(function(){

	homeCtrl.$inject = ['$http' , '$sce'];

	function homeCtrl( $http , $sce ) {

													// GLOBAL VARIABLES
		// =============================================================================================================================
			var vm = this;

			var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

			// Temporaries
			vm.loadingSeasons = false;
			vm.NOW_PLAYING = $sce.trustAsResourceUrl( "http://74.117.181.136:8777/w2cefo4f2k4pcnokaltsxy6n4i3bdvdma4q3pqrjiybbrlzgkyr2qpni6y/v.mp4" );
			vm.backgroundLoadAvailable = true;
			var alreadySearching = false;
			var searchInput = " ";
			var retried = false;
			var episode , season;
			var recievedMP4URLS = [];
			var grabbedEpisodeName;
			var parkedMP4URLS = [];

			// Store Destination Flags
			var catchNullReturn = false;
			var failProviderSearch = false;
			var storeFullSweep = false;
			var storeCurrent = false;
			var storeFuture = false;
			var storePrevious = false;
			var storeRandom = false;
			var storeRandomFuture = false;
			var storeNextOnly = false;
			var storePreviousOnly = false;
			var storeLatest = false;

			vm.latestEpisodes = [];
			vm.showLatestEpisodes = false;

			vm.displayVideo = false;
			vm.showTVShowLinks = false;
			vm.IS_SHUFFLE = false;

			vm.returnedSearchResults = [];

			vm.CURRENT_SHOW = {};
			vm.CURRENT_SHOW.name = " ";
			vm.CURRENT_SHOW.seasons = [];

			vm.CURRENT_SHOW.randomlyGrabbedLinks = [];
			vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];
			vm.CURRENT_SHOW.currentLinks = [];
			vm.CURRENT_SHOW.futureLinks = [];
			vm.CURRENT_SHOW.previousLinks = [];

			vm.CURRENT_SHOW.showID;
			vm.tvURL = " ";

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

			vm.showShuffleButton = false;
			vm.showRetryProviderButton = false;
			vm.showNextButton = false;
			vm.showPreviousButton = false;

			vm.favoriteShows = [

				{
					name: "Family Guy",
					seo_url: "family_guy"
				},
				{
					name: "South Park",
					seo_url: "south_park",
				},
				{
					name: "American Dad",
					seo_url: "american_dad"
				},
				{
					name: "Tosh.0",
					seo_url: "tosh.0"
				},
				{
					name: "Cake Wars",
					seo_url: "cake_wars"
				},
				{
					name: "Cake Masters",
					seo_url: "cake_masters"
				},				
				{
					name: "Project Runway All Stars",
					seo_url: "project_runway_all-stars"
				},
				{
					name: "The Simpsons",
					seo_url: "the_simpsons"
				},
				{
					name: "Rick and Morty",
					seo_url: "rick_and_morty"
				},
				{
					name: "Workaholics",
					seo_url: "workaholics"
				},
				{
					name: "New Girl",
					seo_url: "new_girl"
				},				
				{
					name: "Portlandia",
					seo_url: "portlandia"
				},
				{
					name: "Broad City",
					seo_url: "broad_city"
				},
				{
					name: "Scorpion",
					seo_url: ""
				},
				{
					name: "Limitless",
					seo_url: "limitless"
				},
				{
					name: "Tiny House Nation",
					seo_url: "tiny_house_nation"
				},
				{
					name: "Bob's Burgers",
					seo_url: "bobs_burgers"
				},
				{
					name: "Silicon Valley",
					seo_url: "silicon_valley"
				},
				{
					name: "Weediquette",
					seo_url: "weediquette"
				},
				{
					name: "Adam Devines House Party",
					seo_url: "adam_devines_house_party"
				},
				{
					name: "The Big Bang Theory",
					seo_url: "big_bang_theory"
				},
				{
					name: "2 Broke Girls",
					seo_url: "2_broke_girls"
				},
				{
					name: "Face Off",
					seo_url: "face_off"
				},
				{
					name: "Ace of Cakes",
					seo_url: "ace_of_cakes"
				}

			];

			// VIDEO-QUE
			vm.USING_QUE = false;
			vm.ACTIVE_QUE = [];




		// ============================================GLOBAL VARIABLES=================================================================		

		// thewatchseries.to SEARCH UTILITY
		(function(){

			$("#tvURL").bind( 'input' , function() {

				searchInput = $(this).val().toString();

				if ( searchInput.length >= 3 ) {

					if ( !alreadySearching ) {
						alreadySearching = true;
						console.log( "Searching: " + searchInput + " | " + searchInput.length );
						searchInput = encodeURI(searchInput);
						$http.put( '/api/search/' + searchInput )
							.error(function(e){
								vm.returnedSearchResults = [];
								console.log(e);
							})
							.success(function(data){
								alreadySearching = false;
								vm.returnedSearchResults = $.parseJSON(data);
								vm.returnedSearchResults.pop();
							})
						;
					}
					
				}

			});

		})();

		$(document).ready(function(){

			

		});

		vm.removeFromQue = function(obj) {

		};	

		vm.addToQue = function(obj) {

		};

		vm.goToLatest = function(obj) {

			storeLatest = true;
			vm.loadingSeasons = true;

			vm.nowPlayingEpisodeName 	= "unknown";
			vm.nowPlayingEpisodeNumber  = obj.episodeNumber;
			vm.nowPlayingSeasonNumber 	= obj.seasonNumber;
			recievedMP4URLS = [];

			searchTVShowEpisodeForProviders( obj.showID , obj.seasonNumber , obj.episodeNumber );

		};

		vm.loadLatest = function() {

			vm.loadingSeasons = true;
			$http.put( '/api/loadLatestEpisodes/'  )
				.error(function(e){
					console.log(e);
				})
				.success(function(data){
					vm.latestEpisodes = data;
					vm.loadingSeasons = false;
					vm.showLatestEpisodes = true;
				})
			;

		};


		vm.reset = function() {

			var player1 = null;

			vm.backgroundLoadAvailable = true;
			searchInput = " ";
			vm.returnedSearchResults = [];
			alreadySearching = false;

			$('#removablePlayer').remove();
			displayVideo = false;
			vm.showRetryProviderButton = false;
			vm.showNextButton = false;
			vm.showPreviousButton = false;
			vm.showShuffleButton = false;

			vm.CURRENT_SHOW.name = " ";

			vm.CURRENT_SHOW.currentEpisodeName = null;
			vm.CURRENT_SHOW.currentEpisodeNumber = null;
			vm.CURRENT_SHOW.currentSeasonNumber = null;
			vm.CURRENT_SHOW.futureEpisodeName = null;
			vm.CURRENT_SHOW.futureEpisodeNumber = null;
			vm.CURRENT_SHOW.futureSeasonNumber = null;
			vm.CURRENT_SHOW.previousEpisodeName = null;
			vm.CURRENT_SHOW.previousEpisodeNumber = null;
			vm.CURRENT_SHOW.previousSeasonNumber = null;

			// Random Name Stuff
			vm.CURRENT_SHOW.randomEpisodeName = null;
			vm.CURRENT_SHOW.randomEpisodeNumber = null;
			vm.CURRENT_SHOW.randomSeasonNumber = null;
			vm.CURRENT_SHOW.randomFutureEpisodeName = null;
			vm.CURRENT_SHOW.randomFutureEpisodeNumber = null;
			vm.CURRENT_SHOW.randomFutureSeasonNumber = null;

			// Video Player Config
			vm.nowPlayingEpisodeName = null;
			vm.nowPlayingEpisodeNumber = null;
			vm.nowPlayingSeasonNumber = null;

			vm.loadingSeasons = false;
			vm.NOW_PLAYING = $sce.trustAsResourceUrl( "http://74.117.181.136:8777/w2cefo4f2k4pcnokaltsxy6n4i3bdvdma4q3pqrjiybbrlzgkyr2qpni6y/v.mp4" );
			retried = false;
			episode = null; 
			season = null;
			recievedMP4URLS = [];
			grabbedEpisodeName;
			parkedMP4URLS = [];

			// Store Destination Flags
			catchNullReturn = false;
			storeFullSweep = false;
			failProviderSearch = false;
			storeCurrent = false;
			storeFuture = false;
			storePrevious = false;
			storeRandom = false;
			storeRandomFuture = false;
			storeNextOnly = false;
			storePreviousOnly = false;
			storeLatest = false;

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

			vm.CURRENT_SHOW.showID = null;
			vm.tvURL = " ";


		};

		vm.retryProvider = function() {

			var newURL , x;

			x = ( retried === true ) ? 0 : 1;

			newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentLinks[x] );

			retried = !retried;

			swapVideoSource( newURL );

		};

		vm.loadPrevious = function() {

			vm.showNextButton = false;
			vm.showPreviousButton = false;
			vm.showRetryProviderButton = false

			vm.CURRENT_SHOW.futureLinks = [];
			vm.CURRENT_SHOW.futureLinks = vm.CURRENT_SHOW.currentLinks;
			vm.CURRENT_SHOW.currentLinks = vm.CURRENT_SHOW.previousLinks;
			vm.CURRENT_SHOW.previousLinks = [];

			vm.CURRENT_SHOW.futureEpisodeName 	= vm.CURRENT_SHOW.currentEpisodeName;
			vm.CURRENT_SHOW.futureEpisodeNumber = vm.CURRENT_SHOW.currentEpisodeNumber;
			vm.CURRENT_SHOW.futureSeasonNumber 	= vm.CURRENT_SHOW.currentSeasonNumber;

			// a bit useless , but leaving these extra assignments for now
				vm.CURRENT_SHOW.currentEpisodeName 		= vm.CURRENT_SHOW.previousEpisodeName;
				vm.CURRENT_SHOW.currentEpisodeNumber 	= vm.CURRENT_SHOW.previousEpisodeNumber;
				vm.CURRENT_SHOW.currentSeasonNumber 	= vm.CURRENT_SHOW.previousSeasonNumber;
			// a bit useless , but leaving these extra assignments for now

			vm.nowPlayingEpisodeName 	= vm.CURRENT_SHOW.currentEpisodeName;
			vm.nowPlayingEpisodeNumber 	= vm.CURRENT_SHOW.currentEpisodeNumber;
			vm.nowPlayingSeasonNumber 	= vm.CURRENT_SHOW.currentSeasonNumber;			

			var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentLinks[0] );
			swapVideoSource( newURL );	

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
			
			vm.showNextButton = true;
			vm.showRetryProviderButton = true;	
			storePreviousOnly = true;
			recievedMP4URLS = [];
			searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , season , episode );


		};

		vm.loadNext = function() {

			// Shuffle Mode
			if ( vm.IS_SHUFFLE ) {

				vm.showRetryProviderButton = false;
				vm.showNextButton = false;

				vm.CURRENT_SHOW.randomlyGrabbedLinks = vm.CURRENT_SHOW.randomlyGrabbedFutureLinks;
				
				// a bit useless , but leaving these extra assignments for now
					vm.CURRENT_SHOW.randomEpisodeName 	= vm.CURRENT_SHOW.randomFutureEpisodeName;
					vm.CURRENT_SHOW.randomEpisodeNumber = vm.CURRENT_SHOW.randomFutureEpisodeNumber;
					vm.CURRENT_SHOW.randomSeasonNumber 	= vm.CURRENT_SHOW.randomFutureSeasonNumber;
				// a bit useless , but leaving these extra assignments for now

				vm.nowPlayingEpisodeName 	= vm.CURRENT_SHOW.randomEpisodeName 
				vm.nowPlayingEpisodeNumber 	= vm.CURRENT_SHOW.randomEpisodeNumber
				vm.nowPlayingSeasonNumber 	= vm.CURRENT_SHOW.randomSeasonNumber;

				vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];
				var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.randomlyGrabbedLinks[0] );
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
			else { // Regular Mode

				vm.showRetryProviderButton = false
				vm.showNextButton = false;
				vm.showPreviousButton = false;

				// Swap Video
				vm.CURRENT_SHOW.previousLinks = [];
				vm.CURRENT_SHOW.previousLinks = vm.CURRENT_SHOW.currentLinks;
				vm.CURRENT_SHOW.currentLinks = vm.CURRENT_SHOW.futureLinks;
				vm.CURRENT_SHOW.futureLinks = [];

				vm.CURRENT_SHOW.previousEpisodeName 	= vm.CURRENT_SHOW.currentEpisodeName;
				vm.CURRENT_SHOW.previousEpisodeNumber 	= vm.CURRENT_SHOW.currentEpisodeNumber;
				vm.CURRENT_SHOW.previousSeasonNumber 	= vm.CURRENT_SHOW.currentSeasonNumber;

				// a bit useless , but leaving these extra assignments for now
					vm.CURRENT_SHOW.currentEpisodeName 		= vm.CURRENT_SHOW.futureEpisodeName;
					vm.CURRENT_SHOW.currentEpisodeNumber 	= vm.CURRENT_SHOW.futureEpisodeNumber;
					vm.CURRENT_SHOW.currentSeasonNumber 	= vm.CURRENT_SHOW.futureSeasonNumber;
				// a bit useless , but leaving these extra assignments for now

				vm.nowPlayingEpisodeName 	= vm.CURRENT_SHOW.currentEpisodeName;
				vm.nowPlayingEpisodeNumber 	= vm.CURRENT_SHOW.currentEpisodeNumber;
				vm.nowPlayingSeasonNumber 	= vm.CURRENT_SHOW.currentSeasonNumber;

				var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentLinks[0] );
				swapVideoSource( newURL );				



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

				// Load *New* Next
				vm.showPreviousButton = true;
				vm.showRetryProviderButton = true;
				storeNextOnly = true;
				recievedMP4URLS = [];
				searchTVShowEpisodeForProviders( vm.CURRENT_SHOW.showID , season , episode );

			}

		};

		vm.toggleShuffle = function() {

			vm.IS_SHUFFLE = !vm.IS_SHUFFLE;

			// IF Button-Click Turned shuffle ON  
			if ( vm.IS_SHUFFLE ) {

				vm.CURRENT_SHOW.currentLinks = vm.CURRENT_SHOW.randomlyGrabbedLinks;

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
				
				$('#removablePlayer').remove();
				$("#videoPlayer").append("<div id=\"removablePlayer\" class=\"video-js\" ><video id=\"my-video2\" class=\"vjs-tech\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{\"controls\": true, \"autoplay\": false, \"preload\": \"auto\" }\"><source src=\"" + url + "\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
				

			} , 1200 );

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

			if ( failProviderSearch ) {

				failProviderSearch = false;
				console.log("Failed Provider Search .... ");
				console.log("Probably Were Not any 'Pars able' Providers");

				vm.loadingSeasons = false;
				vm.showTVShowLinks = true;

			}

			else if ( storeFullSweep ) {

				if ( storeCurrent ) {

					vm.loadingSeasons = false;
					storeCurrent = false;
					//console.log("storing into vm.CURRENT_SHOW.currentlinks[]");
					vm.CURRENT_SHOW.currentLinks = recievedMP4URLS;
					storeFuture = true;

					// if episode name was previously unkown
					if ( vm.CURRENT_SHOW.currentEpisodeName === "unknown"  ) {
						vm.CURRENT_SHOW.currentEpisodeName = grabbedEpisodeName;
					} 

					vm.nowPlayingEpisodeName 	= vm.CURRENT_SHOW.currentEpisodeName;
					vm.nowPlayingEpisodeNumber  = vm.CURRENT_SHOW.currentEpisodeNumber;
					vm.nowPlayingSeasonNumber 	= vm.CURRENT_SHOW.currentSeasonNumber;

					vm.displayVideo = true;
					var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentLinks[0] );
					swapVideoSource( newURL );

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

					vm.showNextButton = true;
					vm.showRetryProviderButton = true;

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

					vm.showPreviousButton = true;

					storePrevious = false;
					storeFullSweep = false;
					//console.log("storing into vm.CURRENT_SHOW.previousLinks[]");
					vm.CURRENT_SHOW.previousLinks = recievedMP4URLS;

					console.log( "				FullSweep Success!" );
					console.log("	CurrentLinks = " + vm.CURRENT_SHOW.currentEpisodeName + " S: " + vm.CURRENT_SHOW.currentSeasonNumber + " E: " + vm.CURRENT_SHOW.currentEpisodeNumber );
					console.log( vm.CURRENT_SHOW.currentLinks[0] );
					console.log( vm.CURRENT_SHOW.currentLinks[1] );
					console.log( vm.CURRENT_SHOW.currentLinks[2] );
					console.log( "	FutureLinks =  " + vm.CURRENT_SHOW.futureEpisodeName + " S: " + vm.CURRENT_SHOW.futureSeasonNumber + " E: " + vm.CURRENT_SHOW.futureEpisodeNumber );
					console.log( vm.CURRENT_SHOW.futureLinks[0] );
					console.log( vm.CURRENT_SHOW.futureLinks[1] );
					console.log( vm.CURRENT_SHOW.futureLinks[2] );
					console.log( "	PreviousLinks =  " + vm.CURRENT_SHOW.previousEpisodeName + " S: " + vm.CURRENT_SHOW.previousSeasonNumber + " E: " + vm.CURRENT_SHOW.previousEpisodeNumber );
					console.log( vm.CURRENT_SHOW.previousLinks[0] );
					console.log( vm.CURRENT_SHOW.previousLinks[1] );
					console.log( vm.CURRENT_SHOW.previousLinks[2] );

				}

			}
			else if ( storeRandom ) {
				vm.loadingSeasons = false;
				storeRandom = false;
				vm.backgroundLoadAvailable = true;
				vm.showTVShowLinks = true;
				if ( !vm.showShuffleButton ) { vm.showShuffleButton = true; }

				vm.CURRENT_SHOW.randomEpisodeName = ( vm.CURRENT_SHOW.randomEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.randomEpisodeName;

				vm.CURRENT_SHOW.randomlyGrabbedLinks = recievedMP4URLS;
				console.log("Recieved Random Episode: " + vm.CURRENT_SHOW.randomEpisodeName + " S: " + vm.CURRENT_SHOW.randomSeasonNumber + " E: " + vm.CURRENT_SHOW.randomEpisodeNumber );
				console.log(vm.CURRENT_SHOW.randomlyGrabbedLinks[0]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedLinks[1]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedLinks[2]);
			}
			else if ( storeRandomFuture ) {

				storeRandomFuture = false;
				vm.CURRENT_SHOW.randomFutureEpisodeName = ( vm.CURRENT_SHOW.randomFutureEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.randomFutureEpisodeName;

				vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = recievedMP4URLS;
				console.log("Recieved *NEW* Random Episode: " + vm.CURRENT_SHOW.randomFutureEpisodeName + " S: " + vm.CURRENT_SHOW.randomFutureSeasonNumber + " E: " + vm.CURRENT_SHOW.randomFutureEpisodeNumber );
				console.log(vm.CURRENT_SHOW.randomlyGrabbedFutureLinks[0]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedFutureLinks[1]);
				console.log(vm.CURRENT_SHOW.randomlyGrabbedFutureLinks[2]);

				vm.showRetryProviderButton = true;
				vm.showNextButton = true;

			}
			else if ( storeNextOnly ) {

				storeNextOnly = false;
				vm.CURRENT_SHOW.futureEpisodeName = ( vm.CURRENT_SHOW.futureEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.futureEpisodeName;
				vm.CURRENT_SHOW.futureLinks = recievedMP4URLS;

				console.log("Recieved *NEW* Future Episode: " + vm.CURRENT_SHOW.futureEpisodeName + " S: " + vm.CURRENT_SHOW.futureSeasonNumber + " E: " + vm.CURRENT_SHOW.futureEpisodeNumber );
				console.log(vm.CURRENT_SHOW.futureLinks[0]);
				console.log(vm.CURRENT_SHOW.futureLinks[1]);
				console.log(vm.CURRENT_SHOW.futureLinks[2]);

				vm.showRetryProviderButton = true;
				vm.showNextButton = true;

			}
			else if ( storePreviousOnly ) {

				storePreviousOnly = false;

				vm.CURRENT_SHOW.previousEpisodeName = ( vm.CURRENT_SHOW.previousEpisodeName === "unknown" ) ? grabbedEpisodeName : vm.CURRENT_SHOW.previousEpisodeName;
				vm.CURRENT_SHOW.previousLinks = recievedMP4URLS;

				console.log("Recieved *NEW* Previous Episode: " + vm.CURRENT_SHOW.previousEpisodeName + " S: " + vm.CURRENT_SHOW.previousSeasonNumber + " E: " + vm.CURRENT_SHOW.previousEpisodeNumber );
				console.log(vm.CURRENT_SHOW.previousLinks[0]);
				console.log(vm.CURRENT_SHOW.previousLinks[1]);
				console.log(vm.CURRENT_SHOW.previousLinks[2]);

				vm.showRetryProviderButton = true;
				vm.showPreviousButton = true;

			}
			else if ( storeLatest ) {

				storeLatest = false;
				vm.nowPlayingEpisodeName = grabbedEpisodeName;
				vm.CURRENT_SHOW.currentLinks = recievedMP4URLS;
				var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentLinks[0] );

				vm.loadingSeasons = false;
				vm.showRetryProviderButton = true;
				vm.displayVideo = true;
				swapVideoSource( newURL );

			}


		};

		var getMP4URLS = function( data ) {

			if ( catchNullReturn ) {
				catchNullReturn = false;
				recievedMP4URLS = [ "null.mp4" , "null.mp4" , "null.mp4" ];
				storeLinks();

			}

			else if ( recievedMP4URLS.length < 2 ) {

				var x = data.pop();
				if ( x === undefined ) { storeLinks(); } // MAY NEED TO DELETE !!!! TEMP FIX!
				else {	

					x.provider = x.provider.split(".")[0];
					x.url = x.url.split("/")[3];
					
					console.log( "$http.put( /api/searchProvider/:" + x.provider + "/:" + x.url + " )" );
					$http.put( '/api/searchProvider/' + x.provider + "/" + x.url )
						.error(function(e){
							console.log(e);
							catchNullReturn = true;
							failProviderSearch = true;
							getMP4URLS();
						})
						.success(function(rData){

							if ( rData != undefined && rData != " " && rData.length > 5 ) {

								if ( rData.substring( rData.length - 4 , rData.length ) === ".mp4" || rData.substring( rData.length - 4 , rData.length ) === ".flv" ) {
									recievedMP4URLS.push( rData );
									getMP4URLS( data );
								}
								else {
									console.log( rData );
									getMP4URLS( data );
								}
								
							}
							else {
								getMP4URLS( data );								
							}

						})
					;

				}

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
							if ( data[i].url != "http://null.mp4" ) {
								data[i].url = Base64.decode( data[i].url.split("=")[1] );
							}
							//console.log(data[i].url);
						}
						recievedMP4URLS = [];
						getMP4URLS( data );

					}

				})
			;

		};

		vm.searchTVShow = function(result) {
			if ( vm.tvURL === " " ) { vm.tvURL = "south_park"; }
			if ( result != undefined ) { vm.tvURL = result.seo_url; }
			// vm.tvURL = "south_park";
			vm.returnedSearchResults = null;
			
			var x = vm.tvURL;
			var y = x;
			y = y.replace(/_/g , ' ' );
			vm.CURRENT_SHOW.name = y;

			vm.tvURL = " ";
			vm.loadingSeasons = true;
			searchTVShowHelper( x );
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

			var Re = new RegExp( "\\." , "g" );

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
				
				// friggin tosh.0 check
				// aka generic parser to remove "dots"
				var dotC = tmp.split("_");
				var answer = false;
				for ( y = 0; y < dotC[0].length; ++y ) {
					//console.log(dotC[0][y]);
					if ( dotC[0][y] === "." ) {
						answer = true;
					}
				}
				if ( answer ) {
					dotC[0] = dotC[0].replace( Re , "*" );
					tmp = dotC[0] + "_" + dotC[1] + "_" + dotC[2];
				}

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
			backgroundLoadAvailable = false;
			vm.showTVShowLinks = true;

			// GENERATE RANDOM episode and FETCH 
			var ranS , ranE;
			ranS = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons.length ) ) + 1;
			ranE = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length ) ) + 1;

			vm.CURRENT_SHOW.randomEpisodeName = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ][ vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - ranS ].length - ranE ].name;
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