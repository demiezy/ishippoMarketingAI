var Twitter  	= require('twitter');
var Tweetsdata 		= require('../models/tweets'); 
var Modeldata 	= require('../models/modeloutput');
var NodeGeocoder = require('node-geocoder');


exports.timeline = function (req, res) {
	var params = {screen_name: '@ishippodeals'};

	var client = new Twitter({
	  consumer_key: '5jduAu50TniBJ1Sx7yRvV4kq3',
	  consumer_secret: 'zlq0p9tXNV8n5xgY6mAajja6AY5klIPby4QGKmmbegPi6ZwPSD',
	  access_token_key: '783994860332126208-RWdfTAkA6ZzGQiosQWUBQtgE50ZdzPy',
	  access_token_secret: 'nWVPGGgTji3P7rHNVJU8Ul4ebk9oc3cBMLrkl8cYUyId4'
	});

	client.get('users/show.json?', params, function(err, user) {
	  if (err) {
	  	console.log(err);
	  } else if (!user) {
	  	res.json({ success: false, message: 'No Account found' });
	  } else {
	  	res.json({ success: true, user: user });
	  }
	});	
};

exports.tweetscount = function (req, res) {

	Tweetsdata.count(function(err, count){
		if(err) throw err;

		if(count) {
			res.json({ success: true, count: count });
		}
	});
};

exports.getbarchartdata = function (req, res) {

	Tweetsdata.aggregate([ { $group: { _id: { $add: [ { $dayOfYear: "$created_at"}, { $multiply: [400, {$year: "$created_at"}] } ]}, count: { $sum: 1 }, first: {$min: "$created_at"} } }, { $sort: {_id: -1} }, { $limit: 6 }, { $project: { date: "$first", count: 1, _id: 0} } ]).exec(function (err, count){

		if(err) throw err;

		if(count) {
			res.json({ success: true, count: count });
		}		
	});
};

exports.getmodelchartdata = function (req, res) {

	Modeldata.count(function (err, count){

		if(err) throw err;

		if(count) {
			res.json({ success: true, modeldata: count });
		}
	});
}

exports.getmodelbarchart = function (req, res) {

	Modeldata.aggregate([ { $group: { _id: { $add: [ { $dayOfYear: "$time"}, { $multiply: [400, {$year: "$time"}] } ]}, count: { $sum: 1 }, first: {$min: "$time"} } }, { $sort: {_id: -1} }, { $limit: 6 }, { $project: { date: "$first", count: 1, _id: 0} } ]).exec(function (err, count){

		if(err) throw err;

		if(count) {
			res.json({ success: true, count: count });
		}		
	});
}

//====================== twitter manual crawler =======================================//

// exports.tweetcrawl = function (req, res) {
// 	var keyword = req.body.keyword;
// 	var language = req.body.language;
// 	var result = req.body.result;
// 	var count = req.body.tweetLimit;

// 	if (req.body.keyword == null || req.body.keyword == '' ||  req.body.tweetLimit == null || req.body.tweetLimit == ''){
// 		res.json({ success: false, message: 'Ensure keyword, Tweet Limit were provided' });
// 	} else {

// 		if (req.body.tweetLimit >= 101) {
// 			res.json({ success: false, message: 'The maximum tweets you can return per request is 100' });
// 		} else {

// 			var client = new Twitter({
// 			  consumer_key: 'locihcCBu7B2DkkBjrLrSiW7X',
// 			  consumer_secret: '39IuQJqPOwfkw6jG8yoKH18bv7xevSPeaRhwIVZd1A1PZOHY2e',
// 			  access_token_key: '736081141304680448-HV55FT25K42HfP3u4sK2lmdw7ngvvV7',
// 			  access_token_secret: 'UbtNIgo1N5uYDt9yYtc9TSJ3qNU8Sq5wF4vqEq60fh612'
// 			});

// 			var params = {
// 				q: keyword,
// 				lang: language,
// 				result_type: result,
// 				count: count			
// 			}

// 			client.get('search/tweets', params, function (err, data) {
// 				if (err) {
// 					res.json({ success: false, message: 'Something went wrong! Check your Twitter app credentials' });
// 				} else {
					
// 					var tweets = data.statuses;
// 					for (var i = 0; i < tweets.length; i++) {
// 						// console.log(tweets[i].text);
// 						var tweetpost = new Tweetsdata();
// 						tweetpost.username = tweets[i].user.name;
// 						tweetpost.screenname = tweets[i].user.screen_name;
// 						tweetpost.keyword = keyword;
// 						tweetpost.tweettext = tweets[i].text;
// 						tweetpost.tweetid = tweets[i].id_str;
// 						tweetpost.location = tweets[i].user.location;
// 						tweetpost.followers = tweets[i].user.followers_count;
// 						tweetpost.friends = tweets[i].user.friends_count;
// 						tweetpost.save(function (err) {
// 							if (err) throw err;
// 						});
// 					}

// 					res.json({ success: true, message: 'Tweets Saved Successfully'});	
// 				}
// 			});
// 		}		
// 	}	
// };



var MongoClient = require('mongodb').MongoClient

var URL = 'mongodb://localhost:27017/ishippoai'

exports.tweetcrawl = function (req, res) {
	var keyword = req.body.keyword;
	var language = req.body.language;
	var result = req.body.result;
	var count = req.body.tweetLimit;

	if (req.body.keyword == null || req.body.keyword == '' ||  req.body.tweetLimit == null || req.body.tweetLimit == ''){
		res.json({ success: false, message: 'Ensure keyword, Tweet Limit were provided' });
	} else {

		if (req.body.tweetLimit >= 101) {
			res.json({ success: false, message: 'The maximum tweets you can return per request is 100' });
		} else {

			var client = new Twitter({
			  consumer_key: 'scbbAhaIACTuZIfBc9kiYdKNV',
			  consumer_secret: 'ml6K6M1FkMHS4ocFu8BHlOu1nt3y3q2Jvsgoh4qXIRCIKqDRFj',
			  access_token_key: '942985837016334336-sCs5m5q0DN9t5zOTtkmh1eQx0suzheD',
			  access_token_secret: 'x5t3atRhksgOfRNk8tbGcFmnT6sPBxtpIXwvyMuu8aXTU'
			});

			var params = {
				q: keyword,
				lang: language,
				result_type: result,
				count: count			
			}

			client.get('search/tweets', params, function (err, data) {
				if (err) {
					res.json({ success: false, message: 'Something went wrong! Check your Twitter app credentials' });
				} else {


					MongoClient.connect(URL, function(err, db) {
						if (err) throw err;

						db.listCollections({name: keyword}).next(function(err, collinfo) {
					        if (collinfo) {
					            var tweets = data.statuses;

					        	for (var i = 0; i < tweets.length; i++) {
					    			var myobj = { username: tweets[i].user.name, screenname: tweets[i].user.screen_name, tweettext: tweets[i].text };

					    	    	db.collection(collinfo.name).insertOne(myobj, function(err) {
									    if (err) throw err;
									    
									    console.log("1 document inserted");
									    db.close();
									});
								}
					        } else {
					        	
					        	var tweets = data.statuses;

					        	for (var i = 0; i < tweets.length; i++) {

					    			var myobj = { username: tweets[i].user.name, screenname: tweets[i].user.screen_name, tweettext: tweets[i].text };

					    	    	db.collection(keyword).insertOne(myobj, function(err) {
									    if (err) throw err;
									    
									    console.log("1 document inserted");
									    db.close();
									});
								}
					        }

					        res.json({ success: true, message: 'Tweets Saved Successfully'});

					    });
					});						
				}
			});
		}		
	}	
};

//================================ end manual crawler ======================================//

exports.tweetspreview = function (req, res) {
	Tweetsdata.find({}).sort({$natural : -1}).limit(5).exec (function (err, tweets) {
		if (err) throw err;

		if (tweets) {
			if (tweets.length < 0) {
				res.json({ success: false, message: 'No Tweets Found' });
			} else {
				res.json({ success: true, tweets: tweets });
			}				
		} else {
			res.json({ success: false, message: 'Something went Wrong' });
		}
	})
};


exports.tweet = function (req, res) {
	var tweetTxt = req.body.tweetText;
	var screenName = req.body.screenName;

	if (req.body.tweetText == null || req.body.tweetText == '' || req.body.screenName == null || req.body.screenName == '') {
		res.json({ success: false, message: 'Ensure Recipient, Message were provided!'});
	} else {

		var client = new Twitter({
		  consumer_key: '4kpDeU4t6XpIMkLhbI1wKBp3t',
		  consumer_secret: 'NWiINZxWunUhApqbsZKbuw5WXahJGfkrJ0C1ajbHbMBiqHit5d',
		  access_token_key: '736081141304680448-ab7n4lZZmUU3RnqafL6ei4sGgOZtPuu',
		  access_token_secret: 'qaqUc7sotMROvZXuuEE9hAe1wLrVbtDa23bbFkkyEMeYh'
		});

		var tweet = {
			status: screenName +' '+ tweetTxt.tweetText
		}

		client.post('statuses/update', tweet, function (err, data) {
			if(err) {
				res.json({ success: false, message: 'Something went Wrong' });
			} else {
				res.json({ success: true, message: 'Successfully Tweeted' });
			}
		});
	}
};

exports.retweet = function (req, res) {
	var tweetId = req.body.tid;

	if (req.body.tid == null || req.body.tid == ''){
		res.json ({ success: false, message: 'tweet ID not provided' });
	} else {

		var client = new Twitter({
		  consumer_key: '4kpDeU4t6XpIMkLhbI1wKBp3t',
		  consumer_secret: 'NWiINZxWunUhApqbsZKbuw5WXahJGfkrJ0C1ajbHbMBiqHit5d',
		  access_token_key: '736081141304680448-ab7n4lZZmUU3RnqafL6ei4sGgOZtPuu',
		  access_token_secret: 'qaqUc7sotMROvZXuuEE9hAe1wLrVbtDa23bbFkkyEMeYh'
		});

		client.post('statuses/retweet/' + tweetId, function (err, data) {

		  if(err) {
		  	res.json ({ success: false, message: err });
		  } else {
		  	res.json ({ success: true, message: 'Successfully retweeted' });
		  }
		});		
	}
};

exports.favorites = function (req, res) {
	var tweetId = req.body.tid;

	if (req.body.tid == null || req.body.tid == ''){
		res.json ({ success: false, message: 'tweet ID not provided' });
	} else {

		var client = new Twitter({
		  consumer_key: '4kpDeU4t6XpIMkLhbI1wKBp3t',
		  consumer_secret: 'NWiINZxWunUhApqbsZKbuw5WXahJGfkrJ0C1ajbHbMBiqHit5d',
		  access_token_key: '736081141304680448-ab7n4lZZmUU3RnqafL6ei4sGgOZtPuu',
		  access_token_secret: 'qaqUc7sotMROvZXuuEE9hAe1wLrVbtDa23bbFkkyEMeYh'
		});

		var params = {
			id: tweetId
		}

		client.post('favorites/create', params, function (err, data) {

		  if(err) {
		  	res.json ({ success: false, message: err });
		  } else {
		  	res.json ({ success: true, message: 'Successfully Liked tweet' });
		  }
		});		
	}
};

//================ interval ====================//

// tweet();
// setInterval(tweet, 1000*20)

function tweet() {

	var T = new Twitter({
	  consumer_key: '1ZrC6ElyQvAhnM275K0L0V9o2',
	  consumer_secret: 'yHeEYxPk46RiRfTEjbtkqWw3dQJmsovJlcLsNLwYp96Xz2iuIp',
	  access_token_key: '942985837016334336-UpS4o4VhAcumg29osXJOry0GQsmvV4V',
	  access_token_secret: '5vACnIpa4LijwGi22Vcc9Vb1yJDrRNIBygi3lVthM4F1U'
	});

	Modeldata.find({ targeted: false }).limit(1).exec(function (err, data){
		if(err) throw err;

		if(data) {
			var tweet = {
				status: '@'+data[0].handle + ' ' + 'plz check dis tweet'
			}			

			T.post('statuses/update', tweet, function (err, response) {
				if(err) {

					var duplicateId = data[0]._id;
					Modeldata.findOneAndRemove({ _id: duplicateId}, function (err, duplicate){
						if(err) throw err;
						console.log('User is Deleted Successfully!!');
					});
				} else {

					var Id = data[0]._id;
					Modeldata.findOne({ _id: Id}, function (err, tweet){

						if(err) throw err;

						if(tweet){
							tweet.targeted = true;
							tweet.time = new Date();
							tweet.save(function (err){
								if (err){
									console.log(err);
								} else {
									console.log('Tweeted Successfully!!!');
								}
							});
						}
					});					
				}
			});
		}
	});
}

//================ interval end ====================//

//================ streaming API ====================//

// tweetIt();

// function tweetIt() {

// 	var client = new Twitter({
// 	  consumer_key: '1ZrC6ElyQvAhnM275K0L0V9o2',
// 	  consumer_secret: 'yHeEYxPk46RiRfTEjbtkqWw3dQJmsovJlcLsNLwYp96Xz2iuIp',
// 	  access_token_key: '942985837016334336-UpS4o4VhAcumg29osXJOry0GQsmvV4V',
// 	  access_token_secret: '5vACnIpa4LijwGi22Vcc9Vb1yJDrRNIBygi3lVthM4F1U'
// 	});

// 	// client.stream('statuses/filter', {track: ['handicraft', 'handmade', 'handloom']}, function(stream) {

// 	client.stream('statuses/filter', {track: 'handmade'}, function(stream) {

// 	  	stream.on('data', function(event) {
// 	    	var tweetpost = new Tweetsdata();
// 			tweetpost.username = event.user.name;
// 			tweetpost.screenname = event.user.screen_name;
// 			tweetpost.tweettext = event.text;
// 			tweetpost.tweetid = event.id_str;
// 			tweetpost.keyword = 'handmade';
// 			tweetpost.location = event.user.location;
// 			tweetpost.followers = event.user.followers_count;
// 			tweetpost.friends = event.user.friends_count;
// 			tweetpost.save(function (err) {
// 				if (err) throw err;
// 			});
// 	  	});
	 
// 	  	stream.on('error', function(error) {
// 	   		throw error;
// 	 	});
// 	});
// }


function tweetIt() {

	var client = new Twitter({
	  consumer_key: '1ZrC6ElyQvAhnM275K0L0V9o2',
	  consumer_secret: 'yHeEYxPk46RiRfTEjbtkqWw3dQJmsovJlcLsNLwYp96Xz2iuIp',
	  access_token_key: '942985837016334336-UpS4o4VhAcumg29osXJOry0GQsmvV4V',
	  access_token_secret: '5vACnIpa4LijwGi22Vcc9Vb1yJDrRNIBygi3lVthM4F1U'
	});

	client.stream('statuses/filter', {track: 'handmade'}, function(stream) {

	  	stream.on('data', function(event) {

			var locatVar = event.user.location;

			if (locatVar !== null) {

				var options = {
				  provider: 'google',   // Optional depending on the providers
				  httpAdapter: 'https', // Default
				  apiKey: 'AIzaSyBuPtLLu2ZLTRn0g0mShph8FBi77NQCY20', // for Mapquest, OpenCage, Google Premier
				  formatter: null         // 'gpx', 'string', ...
				};

				geocoder = NodeGeocoder(options);

				geocoder.geocode(locatVar, function(err, res) {

				  	var tweetpost = new Tweetsdata();
					tweetpost.username = event.user.name;
					tweetpost.screenname = event.user.screen_name;
					tweetpost.tweettext = event.text;
					tweetpost.tweetid = event.id_str;
					tweetpost.keyword = 'handmade';
					tweetpost.location = event.user.location;

				  	tweetpost.latitude = res[0].latitude;
				  	tweetpost.longitude = res[0].longitude;

				  	tweetpost.followers = event.user.followers_count;
					tweetpost.friends = event.user.friends_count;
					tweetpost.save(function (err) {
						if (err) throw err;
					});
				});
			} else {

				var tweetpost = new Tweetsdata();
				tweetpost.username = event.user.name;
				tweetpost.screenname = event.user.screen_name;
				tweetpost.tweettext = event.text;
				tweetpost.tweetid = event.id_str;
				tweetpost.keyword = 'handmade';
				tweetpost.location = event.user.location;

			  	tweetpost.latitude = 0;
			  	tweetpost.longitude = 0;

			  	tweetpost.followers = event.user.followers_count;
				tweetpost.friends = event.user.friends_count;
				tweetpost.save(function (err) {
					if (err) throw err;
				});
			}	
			
	  	});
	 
	  	stream.on('error', function(error) {
	   		throw error;
	 	});
	});
}

//================ streaming API end ====================//



