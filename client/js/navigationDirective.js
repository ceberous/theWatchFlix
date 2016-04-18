(function () {

	function navigationGeneric () {
		return {
			restrict: 'EA',
			templateUrl: '/views/navigationDirective.html'
		};
	}

	angular
		.module('theWatchFlixApp')
		.directive('navigationGeneric' , navigationGeneric)
	;


})();