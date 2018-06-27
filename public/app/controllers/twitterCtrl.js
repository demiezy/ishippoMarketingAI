angular.module('twitterController', ['twitterServices', 'chart.js'])

.controller('twitterCtrl', function (Tweet, $scope){
	var app = this;

	Tweet.gettwitter().then(function (data) {
		if (data.data.success) {
			app.likes = data.data.user.favourites_count;
			app.tweets = data.data.user.statuses_count;
			app.following = data.data.user.friends_count;
			app.followers = data.data.user.followers_count;
		} else {
			app.errorMsg = data.data.message;
		}
	});


	Tweet.getmodeldatachart().then(function (data){

		if(data.data.success) {

			app.modeloutput = data.data.modeldata;
		}		
	});

	Tweet.gettweetscount().then(function (data){

		if(data.data.success) {

			$scope.tweetslabels = ["Negative Tweets", "Positive Tweets"];			
			$scope.data = [];

			var totaltweets = data.data.count;
			var moutput = app.modeloutput;

			var count = totaltweets - moutput;

			$scope.data.push(count);
			$scope.data.push(app.modeloutput);
			$scope.totalcount = data.data.count;
		}		
	});	

	Tweet.getbarchartdata().then(function (data){

		if (data.data.success) {

			data = data.data.count;

			$scope.value = [];
			$scope.labels = [];

			for(var i = 0; i < data.length; i++) {

			    $scope.value.push(data[i].count);		    

			    var myDate= data[i].date;
			    myDate = myDate.split('T')[0];
			    $scope.labels.push(myDate);
			}
		}		
	});

	// Tweet.getmodeldatachart().then(function (data){

	// 	if(data.data.success) {

	// 		$scope.labels = ["Total Tweets"];
			
	// 		$scope.mdata = [];
	// 		$scope.mdata.push(data.data.modeldata);
	// 		$scope.modelcount = data.data.modeldata;
	// 	}		
	// });

	Tweet.getmodelbarchart().then(function (data){

		if (data.data.success) {

			data = data.data.count;

			$scope.mvalue = [];
			$scope.mlabels = [];

			for(var i = 0; i < data.length; i++) {

			    $scope.mvalue.push(data[i].count);	

			    var myDate= data[i].date;
			    myDate = myDate.split('T')[0];
			    $scope.mlabels.push(myDate);
			}
		}		
	});
})

.controller('tweettableCtrl', function (Tweet, $scope, $timeout, $route){ 

	var app = this;

	$scope.currentPage = 1;
	$scope.pageSize = 10;
	$scope.maxSize = 10;

	Tweet.getTweets().then(function (data) {
		if (data.data.success) {
			app.tweetsData = data.data.tweets;
		} else {
			data.errorMsg = 'No Tweets Found';
		}
	});

	app.getName = function (tweet) {
		$scope.screenName = '@' + tweet.screenname;
		$('#tweetModal').modal('show');
	};

	app.tweetSend = function (screenname, tweettext, valid) {
		
		app.successMsg = false;
		app.errorMsg = false;	

		if(valid) {
			var tweetObject = {};
			tweetObject.screenName = screenname;
			tweetObject.tweetText = tweettext;		
			
			Tweet.sendTweet(tweetObject).then(function (data) {
				if(data.data.success) {	

					app.successMsg = data.data.message;					
					$timeout(function(){
						app.successMsg = false;	
						hideModal(); // Close modal
						$route.reload();				
					}, 2000);
				} else {				
					app.errorMsg = data.data.message;					
				}
			});
		} else {
			app.errorMsg = 'Please ensure form is filled out properly';
		}
	};

	var hideModal = function () {
		$("#tweetModal").modal('hide');
	};

	app.reTweet = function (tweetId) {
		var tweetIds = {};
		tweetIds.tid = tweetId;

		Tweet.reTweet(tweetIds).then(function (data){
			app.successMssg = false;
			app.errorMssg = false;

			if(data.data.success) {
				app.successMssg = data.data.message
			} else {
				app.errorMssg = data.data.message;
			}
		});
	};

	app.likeTweet = function (tweetId) {
		var tweetIds = {};
		tweetIds.tid = tweetId;

		Tweet.likeTweet(tweetIds).then(function (data){
			app.successMssg = false;
			app.errorMssg = false;

			if(data.data.success) {
				app.successMssg = data.data.message
			} else {
				app.errorMssg = data.data.message;
			}
		});
	};
})

.filter('pagination', function() {
	return function (data, start) {
		if (!data || !data.length) { return; }
		return data.slice(start);
	};
})


.controller('tweetsCtrl', function (Tweet, $scope) {

	var app = this;
	app.successMsg = false;
	app.errorMsg = false;

	$scope.languages = ["en", "eu"];
	$scope.results = ["mixed", "recent", "popular"];

	function getTweest() {
		Tweet.getTweets().then(function (data) {
			if (data.data.success) {
				app.tweets = data.data.tweets;	
			} else {
				data.errorMsg = 'No Tweets Found';
			}
		});
	}

	getTweest();

	app.tweetCrawl = function (tweetKeyword) {

		Tweet.crawlTweets(app.tweetKeyword).then(function (data){

			if (data.data.success) {
				app.successMsg = data.data.message;
				$scope.languages = '';
				$scope.results = '';
				app.tweetKeyword.keyword = '';
				app.tweetKeyword.tweetLimit = '';
			} else {
				app.errorMsg = data.data.message;
			}		
		});
	};
})

		.controller('tweetlocation', function (Tweet, $scope){

			Tweet.getTweets().then(function (data) {
				if (data.data.success) {
					data = data.data.tweets;
					var latlong = [];
					console.log(latlong);
					for(var i = 0; i < data.length; i++) {
						latlong.push(
								data[i]._id= {
									"lat" : data[i].latitude,
									"lng" : data[i].longitude,
								}
						);
					}
//----------------------------------------------------

					//var min = 1;
					//var max = 3910;
					//var data = addressPoints.map(function (p) {
					//	// normalize intensity values to between 0 and 1
					//	var intensity = parseInt(p[2]) || 0;
					//	var normalized = (intensity - min) / (max - min);
					//	return { lat: p[0], lng: p[1]};
					//});
					var data = latlong;
					console.log("DATA", data);

					var testData = {
						data: data
					};

					var cfg = {
						// radius should be small ONLY if scaleRadius is true (or small radius is intended)
						// if scaleRadius is false it will be the constant radius used in pixels
						"radius": 15,
						"maxOpacity": .5,
						// scales the radius based on map zoom
						"scaleRadius": false,
						// if set to false the heatmap uses the global maximum for colorization
						// if activated: uses the data maximum within the current map boundaries
						//   (there will always be a red spot with useLocalExtremas true)
						"useLocalExtrema": true,
						// which field name in your data represents the latitude - default "lat"
						latField: 'lat',
						// which field name in your data represents the longitude - default "lng"
						lngField: 'lng',
						// which field name in your data represents the data value - default "value"
						valueField: 'count',
						blur: 0.95,
						gradient: {
							'.5': 'yellow',
							'.8': 'orange',
							'.95': 'red'
						}
					};

					var map = L.map('map',{
						zoomAnimation: false
					});
					L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
							{maxZoom: 19}).addTo(map);

					var heatmapLayer = new HeatmapOverlay(cfg).addTo(map);
					map.fitWorld().zoomIn();

					map.on('resize', function(e) {
						map.fitWorld({reset: true}).zoomIn();
					});
					heatmapLayer.setData(testData);

//----------------------------------------------------
					//$(function(){
					//	$('#world-map-markers').vectorMap({
					//		map: 'world_mill_en',
					//		normalizeFunction: 'polynomial',
					//		hoverOpacity     : 0.7,
					//		hoverColor       : false,
					//		backgroundColor  : 'transparent',
					//		regionStyle      : {
					//			initial      : {
					//				fill            : 'rgba(210, 214, 222, 1)',
					//				'fill-opacity'  : 1,
					//				stroke          : 'none',
					//				'stroke-width'  : 0,
					//				'stroke-opacity': 1
					//			},
					//			hover        : {
					//				'fill-opacity': 0.7,
					//				cursor        : 'pointer'
					//			},
					//			selected     : {
					//				fill: 'yellow'
					//			},
					//			selectedHover: {}
					//		},
					//		markerStyle      : {
					//			initial: {
					//				fill  : '#F8E23B',
					//				stroke: '#383f47'
					//			}
					//		},
					//		markers: $scope.plot
                    //
					//	});
					//});
				} else {
					data.errorMsg = 'No Tweets Found';
				}
			});


		});