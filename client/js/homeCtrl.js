(function(){

	homeCtrl.$inject = ['$http' , '$sce'];

	function homeCtrl( $http , $sce ) {


		var vm = this;

		vm.displayVideo = false;
		vm.showTVShowLinks = false;
		vm.IS_SHUFFLE = false;

		vm.CURRENT_SHOW = {};
		vm.CURRENT_SHOW.seasons = [];

		vm.CURRENT_SHOW.randomlyGrabbedLinks = [];
		vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];

		vm.CURRENT_SHOW.showID;
		vm.tvURL = "south_park";

		vm.searchTVShow = function() {
			// vm.tvURL = "south_park";
			searchTVShowHelper( vm.tvURL );
		};


		var searchTVShowHelper = function( showID ) {

			vm.CURRENT_SHOW.showID = showID;
			console.log("Grabbing Season for TV-SHOW: " + showID );

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

				console.log( "S: " + s + "E: " + e + " : " + linkName );

				var episode = {
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