angular.module('twitterServices', [])

.factory('Tweet', function ($http) {

	var twitterFactory = {};

	twitterFactory.gettwitter = function () {
		return $http.get('/api/twittertimeline/');
	}

	twitterFactory.gettweetscount = function () {
		return $http.get('/api/tweetscount/');
	}

	twitterFactory.getbarchartdata = function () {
		return $http.get('/api/getbarchartdata/');
	}

	twitterFactory.getmodeldatachart = function () {
		return $http.get('/api/getmodelchartdata/');
	}

	twitterFactory.getmodelbarchart = function () {
		return $http.get('/api/getmodelbarchart/');
	}

	twitterFactory.crawlTweets = function (tweetKeyword) {
		return $http.post('/api/tweetcrawler', tweetKeyword);
	}

	twitterFactory.getTweets = function () {
		return $http.get('/api/tweets');
	}

	twitterFactory.sendTweet = function (tweetObject) {
		return $http.post('/api/tweet', tweetObject);
	}

	twitterFactory.reTweet = function (tweetId) {
		return $http.post('/api/retweet', tweetId);
	}

	twitterFactory.likeTweet = function (tweetId) {
		return $http.post('/api/favorites', tweetId);
	}

	return twitterFactory;	
});