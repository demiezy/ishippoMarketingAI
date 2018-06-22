angular.module('managementController', ['userServices'])

.controller('managementCtrl', function (User) {
	var app = this;

	app.loading = true;
	app.accessDenied = true;
	app.errorMsg = false;

	function  getUsers() {
		User.getUsers().then(function (data) {
			if (data.data.success) {
				if (data.data.permission === 'admin') {
					app.users = data.data.users;
					app.loading = false;
					app.accessDenied = false;
				} else {
					app.errorMsg = 'Insufficient permission';
					app.loading = false;
				}
			} else {
				app.errorMsg = data.data.message;
				app.loading = false;
			}
		});
	}

	getUsers();

	app.deleteUser = function (username) {
		User.deleteUser(username).then(function (data) {
			if (data.data.success) {
				getUsers();
			} else {
				app.errorMsg = data.data.message;
			}
		});
	};
})

.controller('editCtrl', function ($scope, User, $routeParams, $timeout) {
	var app = this;

	$scope.nameTab = 'active';
	app.phase1 = true;

	User.getUser($routeParams.id).then(function (data) {
		if (data.data.success) {
			$scope.newName = data.data.user.name;
			$scope.newEmail = data.data.user.email;
			$scope.newUsername = data.data.user.username;
			$scope.newPermission = data.data.user.permission;
			app.currentUser = data.data.user._id;
		} else {
			app.errorMsg = data.data.message;
		}
	});

	app.namePhase = function () {

		$scope.nameTab = 'active';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'default';
		app.phase1 = true;
		app.phase2 = false;
		app.phase3 = false;
		app.phase4 = false;
		app.errorMsg = false;
	};

	app.usernamePhase = function () {
		
		$scope.nameTab = 'default';
		$scope.usernameTab = 'active';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'default';
		app.phase1 = false;
		app.phase2 = true;
		app.phase3 = false;
		app.phase4 = false;
		app.errorMsg = false;
	};

	app.emailPhase = function () {
		
		$scope.nameTab = 'default';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'active';
		$scope.permissionTab = 'default';
		app.phase1 = false;
		app.phase2 = false;
		app.phase3 = true;
		app.phase4 = false;
		app.errorMsg = false;
	};

	app.permissionPhase = function () {
		
		$scope.nameTab = 'default';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'active';
		app.phase1 = false;
		app.phase2 = false;
		app.phase3 = false;
		app.phase4 = true;
		app.disableUser = false;
		app.disableAdmin = false;
		app.errorMsg = false;

		if ($scope.newPermission === 'user') {
			app.disableUser = true;
		} else if ($scope.newPermission === 'admin') {
			app.disableAdmin = true;
		}
	};

	app.updateName = function (newName, valid) {

		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};
		
		if (valid) {
			userObject._id = app.currentUser;
			userObject.name = $scope.newName;

			User.editUser(userObject).then(function (data) {
				if (data.data.success) {
					app.successMsg = data.data.message;
					$timeout(function () {
						app.nameForm.name.$setPristine();
						app.nameForm.name.$setUntouched();
						app.successMsg = false;
						app.disabled = false;
					}, 2000);
				} else {
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		} else {
			app.errorMsg = 'Please ensure form is filled out properly';
			app.disabled = false;
		}
	};

	app.updateEmail = function (newEmail, valid) {

		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};
		
		if (valid) {
			userObject._id = app.currentUser;
			userObject.email = $scope.newEmail;

			User.editUser(userObject).then(function (data) {
				if (data.data.success) {
					app.successMsg = data.data.message;
					$timeout(function () {
						app.emailForm.email.$setPristine();
						app.emailForm.email.$setUntouched();
						app.successMsg = false;
						app.disabled = false;
					}, 2000);
				} else {
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		} else {
			app.errorMsg = 'Please ensure form is filled out properly';
			app.disabled = false;
		}
	};

	app.updateUsername = function (newUsername, valid) {

		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};
		
		if (valid) {
			userObject._id = app.currentUser;
			userObject.username = $scope.newUsername;

			User.editUser(userObject).then(function (data) {
				if (data.data.success) {
					app.successMsg = data.data.message;
					$timeout(function () {
						app.usernameForm.username.$setPristine();
						app.usernameForm.username.$setUntouched();
						app.successMsg = false;
						app.disabled = false;
					}, 2000);
				} else {
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		} else {
			app.errorMsg = 'Please ensure form is filled out properly';
			app.disabled = false;
		}
	};

	app.updatePermissions = function (newPermission) {

		app.errorMsg = false;
		app.disabled = true;
		app.disableUser = true;
		app.disableAdmin = true;
		var userObject = {};
		
		userObject._id = app.currentUser;
		userObject.permission = newPermission;

		User.editUser(userObject).then(function (data) {
			if (data.data.success) {
				app.successMsg = data.data.message;
				$timeout(function () {					
					app.successMsg = false;

					if (newPermission === 'user') {
						$scope.newPermission = 'user';
						app.disableUser = true;
						app.disableAdmin = false;
					} else if (newPermission === 'admin') {
						$scope.newPermission = 'admin';
						app.disableAdmin = true;
						app.disableUser = false;
					}					
				}, 2000);
			} else {
				app.errorMsg = data.data.message;
				app.disabled = false;
				
			}
		});
	};
});