(function () {
	
	angular.module('theWatchFlixApp' , [ 
		'ui.router',
		'ngSanitize',
	]);

	function config ( $stateProvider , $urlRouterProvider , $locationProvider ) {

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});

		$urlRouterProvider.otherwise('/');

		$stateProvider

			.state('home' , {
				url: '/',
				templateUrl: 'views/home.html',
				controller: 'homeCtrl',
				controllerAs: 'vm'
			})

		;

	}

	angular
		.module('theWatchFlixApp')
		.config(['$stateProvider', '$urlRouterProvider' , '$locationProvider' , config])
	;

})();