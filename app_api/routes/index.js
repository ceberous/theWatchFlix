var express = require('express');
var router = express.Router();

var theWatchFlixCtrl = require( '../controllers/theWatchFlixMain' );

router.put( '/loadLatestEpisodes/' , theWatchFlixCtrl.loadLatestEpisodes );

router.put( '/search/:searchString' , theWatchFlixCtrl.search );

router.put( '/searchTVShow/:showID' , theWatchFlixCtrl.searchTVShow );
router.put( '/searchTVShowEpisodeForProviders/:showID/:season/:episode' , theWatchFlixCtrl.searchTVShowEpisodeForProviders );
router.put( '/searchProvider/:provider/:url' , theWatchFlixCtrl.searchProvider );

module.exports = router;