var mongoose = require('mongoose'); // Import Mongoose Package
var Schema   = mongoose.Schema; // Assign Mongoose Schema to variable

var TweetsSchema = new Schema({
	username: { type: String, required: false },
	screenname: { type: String, required: true },
	tweettext: { type: String, required: true },
	tweetid: { type: String, required: true },
	keyword: { type: String, required: true },
	location: { type: String, required: false },
	latitude: { type: Number, required: false },
	longitude: { type: Number, required: false },
	followers: { type: String, required: false },
	friends: { type: String, required: false },
	status: { type: Boolean, required: true, default: false },
	created_at: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Tweetsdata', TweetsSchema);