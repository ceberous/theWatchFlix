var express = require('express');
var router = express.Router();

var theWatchFlixCtrl = require( '../controllers/theWatchFlixMain' );

router.put( '/searchTVShow/:showID' , theWatchFlixCtrl.searchTVShow );


module.exports = router;