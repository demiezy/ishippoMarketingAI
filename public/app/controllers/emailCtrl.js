angular.module('emailController', ['userServices'])

.controller('emailCtrl', function ($routeParams, User, $timeout, $location) {
	
	app = this;

	User.activeAccount($routeParams.token).then(function (data) {

		app.successMsg = false;
		app.errorMsg = false;

		if (data.data.success) {
			app.successMsg = data.data.message + '.....Redirecting';
			$timeout(function () {
				$location.path('/login');
			}, 2000);
		} else {
			app.errorMsg = data.data.message + '.....Redirecting';
			$timeout(function () {
				$location.path('/login');
			}, 2000);
		}
	});
})

.controller('resendCtrl', function (User) {
	
	app = this;

	app.checkCredential = function (loginData) {
		app.disabled = true;
		app.errorMsg = false;
		app.successMsg = false;

		User.checkCredential(app.loginData).then(function (data){
			if (data.data.success) {
				User.resendLink(app.loginData).then(function (data){
					if (data.data.success) {
						app.successMsg = data.data.message;
					} else {
						app.errorMsg = data.data.message;
					}
				});
			} else {
				app.errorMsg = data.data.message;
				app.disabled = false;
			}
		});
	};
})

.controller('passwordCtrl', function (User) {
	
	app = this;

	app.sendPassword = function (resetData, valid) {
		app.errorMsg = false;
		app.disabled = true;

		if (valid) {
			User.sendPassword(app.resetData).then(function (data) {				
				if (data.data.success) {
					app.successMsg = data.data.message;
				} else {
					app.disabled = false;
					app.errorMsg = data.data.message;
				}
			});
		} else {
			app.disabled = false;
			app.errorMsg = 'please enter a valid username';
		}
	};
})

.controller('resetCtrl', function (User, $routeParams, $scope){

	app = this;
	app.hide = true;

	User.resetUser($routeParams.token).then(function (data) {
		if (data.data.success) {
			app.hide = false;
			app.successMsg = 'please enter a new password';
			$scope.username = data.data.user.username;
		} else {
			app.errorMsg = data.data.message;
		}
	});

	app.savePassword = function (regData, valid, confirmed) {
		app.errorMsg = false;
		app.disabled = true;


		if (valid && confirmed){
			app.regData.username = $scope.username;
			User.savePassword(app.regData).then(function (data) {
				if (data.data.success) {
					app.successMsg = data.data.message + '....Redirecting';
					$timeout(function () {
						$location.path('/login');
					}, 2000);
				} else {
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		} else {
			app.disabled = false;
			app.errorMsg = 'please ensure form is filled properly';
		}	
	};
});	