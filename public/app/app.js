angular.module('userApp', [
	'appRoutes',
	'ui.bootstrap',
	'userControllers',
	'userServices', 
	'ngAnimate', 
	'mainController', 
	'authServices', 
	'emailController', 
	'managementController', 
	'twitterController',
	'twitterServices'])

.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
});