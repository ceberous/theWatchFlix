(function () {

	function footerGeneric () {
		return {
			restrict: 'EA',
			templateUrl: '/views/footerGeneric.html'
		};
	}

	angular
		.module('theWatchFlixApp')
		.directive('footerGeneric' , footerGeneric)
	;


})();

