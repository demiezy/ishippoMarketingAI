var app = angular.module('appRoutes', ['ngRoute'])

.config(function ($routeProvider, $locationProvider) {

	$routeProvider

	.when('/', {
		templateUrl: 'app/views/pages/home.html'
	})

	.when('/about', {
		templateUrl: 'app/views/pages/about.html',
		controller: 'tweetlocation',
		controllerAs: 'location',
		authenticated: true
	})

	.when('/register',{
		templateUrl: 'app/views/pages/users/register.html',
		controller: 'regCtrl',
		controllerAs: 'register',
		authenticated: false
	})

	.when('/login', {
		templateUrl: 'app/views/pages/users/login.html',
		authenticated: false
	})

	.when('/logout', {
		templateUrl: 'app/views/pages/users/logout.html',
		authenticated: true
	})

	.when('/profile', {
		templateUrl: 'app/views/pages/users/profile.html',
		authenticated: true
	})

	.when('/activate/:token', {
		templateUrl: 'app/views/pages/users/activation/activate.html',
		controller: 'emailCtrl',
		controllerAs: 'email',
		authenticated: false
	})

	.when('/resend', {
		templateUrl: 'app/views/pages/users/activation/resend.html',
		controller: 'resendCtrl',
		controllerAs: 'resend',
		authenticated: false
	})

	.when('/resetpassword', {
		templateUrl: 'app/views/pages/users/reset/password.html',
		controller: 'passwordCtrl',
		controllerAs: 'password',
		authenticated: false
	})

	.when('/reset/:token', {
		templateUrl: 'app/views/pages/users/reset/newpassword.html',
		controller: 'resetCtrl',
		controllerAs: 'reset',
		authenticated: false

	})

	.when('/management', {
		templateUrl: 'app/views/management/management.html',
		controller: 'managementCtrl',
		controllerAs: 'management',
		authenticated: true,
		permission: ['admin']
	})

	.when('/edit/:id', {
		templateUrl: 'app/views/management/edit.html',
		controller: 'editCtrl',
		controllerAs: 'edit',
		authenticated: true,
		permission: ['admin']
	})

	.when('/twittertimeline', {
		templateUrl: 'app/views/twitter/twittertimeline.html',
		controller: 'twitterCtrl',
		controllerAs: 'twitter',
		authenticated: true
	})

	.when('/tweetcrawler', {
		templateUrl: 'app/views/twitter/tweetcrawler.html',
		controller: 'tweetsCtrl',
		controllerAs: 'crawler',
		authenticated: true
	})

	.when('/tweetstable', {
		templateUrl: 'app/views/twitter/tweetstable.html',
		controller: 'tweettableCtrl',
		controllerAs: 'tweets',
		authenticated: true
	})

	.otherwise({ redirectTo: '/'});

	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
});

app.run(['$rootScope', 'Auth', '$location', 'User', function ($rootScope, Auth, $location, User) {

	$rootScope.$on('$routeChangeStart', function (event, next, current) {

		if (next.$$route.authenticated == true){
			if (!Auth.isLoggedIn()){
				event.preventDefault();
				$location.path('/');
			} else if (next.$$route.permission) {
				User.getPermission().then(function (data) {
					if (next.$$route.permission[0] !== data.data.permission) {
						event.preventDefault();
						$location.path('/');
					}
				});
			}

		} else if (next.$$route.authenticated == false) {
			if(Auth.isLoggedIn()) {
				event.preventDefault();
				$location.path('/profile');
			}
		}
	});
}]);