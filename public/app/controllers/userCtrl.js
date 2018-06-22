angular.module('userControllers', ['userServices'])
	
.controller('regCtrl', function ($http, $location, $timeout, User) {

	var app = this;

	app.regUser = function (regData, valid, confirmed) {
		app.disabled = true;
		app.loading = true;
		app.errorMsg = false;
		
		if (valid && confirmed) {
			User.create(app.regData).then(function (data) {

				if (data.data.success) {
					app.loading = false;
					app.successMsg = data.data.message + '.....Redirecting';
					$timeout(function (){
						$location.path('/login');
					}, 2000);
				} else {
					app.disabled = false;
					app.loading = false;
					app.errorMsg = data.data.message;
				}
			});
		} else {
			app.disabled = false;
			app.loading = false;
			app.errorMsg = 'Please ensure form is filled out properlly';
		}
	};

	app.checkUsername = function (regData) {
		app.checkingUsername = true;
		app.usernameMsg = false;
		app.usernameInvalid = false;

		User.checkUsername(app.regData).then(function (data) {
			if (data.data.success) {
				app.checkingUsername = false;
				app.usernameInvalid = false;
				app.usernameMsg = data.data.message;
			} else {
				app.checkingUsername = false;
				app.usernameInvalid = true;
				app.usernameMsg = data.data.message;
			}
		});
	}; 

	app.checkEmail = function (regData) {
		app.checkingEmail = true;
		app.emailInvalid = false;
		app.emailMsg = false;

		User.checkEmail(app.regData).then(function (data) {
			if (data.data.success) {
				app.checkingEmail = false;
				app.emailInvalid = false;
				app.emailMsg = data.data.message;
			} else {
				app.checkingEmail = false;
				app.emailInvalid = true;
				app.emailMsg = data.data.message;
			}
		});
	}; 
})

.directive('match', function(){
	return {
		restrict: 'A',
		controller: function($scope){

			$scope.confirmed = false;

			$scope.doConfirm = function(values) {
				values.forEach(function(ele) {

					if ($scope.confirm == ele) {
						$scope.confirmed = true;
					} else {
						$scope.confirmed = false;
					}
				});
			}
		},
		
		link: function(scope, element, attrs) {

			attrs.$observe('match', function() {
				scope.matches = JSON.parse(attrs.match);
				scope.doConfirm(scope.matches);
			});

			scope.$watch('confirm', function(){
				scope.matches = JSON.parse(attrs.match);
				scope.doConfirm(scope.matches);
			});
		}
	}
})