angular.module('mainController', ['authServices', 'userServices'])

.controller('mainCtrl', function (Auth, $location, $timeout, $rootScope, $interval, $window, User, AuthToken) {

	var app = this;
	app.loadme = false;

	app.checkSession = function () {
		if (Auth.isLoggedIn()){
			app.checkingSession = true;
			var interval = $interval(function (){
				var token = $window.localStorage.getItem('token'); // retrive the user's token from the client local storage
				// Ensure token is not null (will normally not occur if interval and token expiration is setup properly)
				if (token === null) {
					$interval.cancel(interval); // Cancle interval if token is null
				} else {
					// Parse JSON web token using AngularJS for timestamp conversion
					self.parseJwt = function(token) {
						var base64Url = token.split('.')[1];
						var base64 = base64Url.replace('-', '+').replace('_', '/');
						return JSON.parse($window.atob(base64));
					}
					var expireTime = self.parseJwt(token); // Save parsed token into variable
					var timeStamp = Math.floor(Date.now() / 1000); // Get current datetime timestamp
					var timeCheck = expireTime.exp - timeStamp; // Subtract to get remaining time of token
					// Check if token has Less than 30 minutes till expiration					
					if (timeCheck <= 25) {
						showModal(1); // Open bootstrap modal and let user decide what to do
						$interval.cancel(interval); // Stop interval
					} else {
						console.log('token not expired');
					}
				}
			}, 2000);
		}
	};

	app.checkSession();

	var showModal = function (option) {
		app.choiceMade = false; // Clear choiceMade on startup
		app.modalHeader = undefined; // Clear modalHeader on startup
		app.modalBody = undefined; // Clear modalBody on startup
		app.hideButton = false; // Clear hideButton on startup

		// Check which modal option to activate (option 1: session expired or about to expire, option 2: log the user Out)
		if(option === 1){
			app.modalHeader = 'Timeout Warning'; // set Header
			app.modalBody = 'Your session will expired in 30 minutes. Would you like to renew your session?'; // set Body
			$("#myModal").modal({ backdrop: "static" }); // Open modal
			//Give user 10 seconds to make a decission 'yes' / 'no'
			$timeout(function(){
				if (!app.choiceMade) app.endSession(); // If no choice is made after 10 seconds, select 'no' for them
			}, 10000);
		} else if (option === 2) {
			app.hideButton = true; // Hide 'yes'/'no' buttons
			app.modalHeader = 'Logging Out'; // Set Header
			$("#myModal").modal({ backdrop: "static" }); // Open modal
			// After 2000 milliseconds (2 seconds), hide modal and log user Out
			$timeout(function(){
				Auth.logout(); // logout the user
				$location.path('/logout'); // change route to clear user object
				hideModal(); // Close modal
			}, 2000);
		}
	}

	// Function that allows user to renew their token to stay logged in (activated when user presses 'yes')
	app.renewSession = function(){
		app.choiceMade = true; // Set to true to stop 10 seconds check in option 1
		// Function to retrive a new token for the user
		User.renewSession(app.username).then(function (data){
			if(data.data.success) {
				AuthToken.setToken(data.data.token); // Re-set token
				app.checkSession(); // Re - initiate session checking
			} else {
				app.modalBody = data.data.message; // Set error message
			}
		});
		hideModal(); // Close modal
	};	

	// Function to expire session and logout (activated when user presses 'No')
	app.endSession = function(){
		app.choiceMade = true; // Set to true to stop 10 seconds check in option 1
		hideModal(); // Hide modal
		// After 1 second, activate modal option 2 (log Out)
		$timeout(function() {
			showModal(2); // logout user
		}, 1000);
	};

	var hideModal = function () {
		$("#myModal").modal('hide');
	}


	$rootScope.$on('$routeChangeStart', function(){
		
		if (!app.checkSession) app.checkSession();

		if (Auth.isLoggedIn()) {
			app.isLoggedIn = true;
			Auth.getUser().then(function (data) {
				app.username = data.data.username;
				app.useremail = data.data.email;

				User.getPermission().then(function (data) {
					if (data.data.permission === 'admin'){
						app.authorized = true;
						app.loadme = true;
					} else {
						app.loadme = true;
					}
				});
				
			});
		} else {
			app.isLoggedIn = false;
			app.username = '';
			app.loadme = true;
		}

		if($location.hash() == '_#_') $location.hash(null);
		app.disabled = false; // Re-enable any forms
		app.errorMsg = false; // clear any error message
	});

	app.doLogin = function (loginData) {
		app.loading = true;
		app.errorMsg = false;
		app.expired = false;
		app.disabled = true;

		Auth.login(app.loginData).then(function (data) {
			if (data.data.success) {
				app.loading = false;
				app.successMsg = data.data.message + '.....Redirecting';
				$timeout(function () {
					$location.path('/about');
					// app.loginData = '';
					app.loginData = {};
					app.successMsg = false;
					app.disabled = false; // Enable form on submission
					app.checkSession();
				}, 2000);
			} else {
				if (data.data.expired) {
					app.expired = true;
					app.loading = false;
					app.errorMsg = data.data.message;
				} else {
					app.loading = false;
					app.disabled = false;
					app.errorMsg = data.data.message;
				}
			}
		});
	};

	app.logout = function () {
		showModal(2);
	};
});