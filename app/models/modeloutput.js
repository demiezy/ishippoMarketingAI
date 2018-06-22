var mongoose = require('mongoose'); // Import Mongoose Package
var Schema   = mongoose.Schema; // Assign Mongoose Schema to variable

var ModelSchema = new Schema({

	handle: { type: String, required: true },
	targeted: { type: Boolean, required: true, default: false },
	time: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Twitteroutput', ModelSchema);