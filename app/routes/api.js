var User 		= require('../models/user'); // Import User Model
var jwt			= require('jsonwebtoken');
var secret		= 'ishippo@ai';
var nodemailer  = require('nodemailer'); // Import nodemailer Package
var sgTransport = require('nodemailer-sendgrid-transport'); // Import Nodemailer Sendgrid Transport Package
var Twitter  	= require('twitter');

var tweets = require('../controllers/tweets');
var python = require('../controllers/pythonscript');

module.exports = function (router) {

	// Start Sendgrid Configuration Settings
	var options = {
	  auth: {
	    api_user: 'iamdilipkumar', // Sendgrid username
	    api_key: '9916399256dilip' // Sendgrid password
	  }
	}

	var client = nodemailer.createTransport(sgTransport(options));
	// End Sendgrid Configuration Settings

	router.post('/users', function (req, res) {
		var user = new User(); 				// Create new User object
		user.username = req.body.username; // Save username from request to User object
		user.email = req.body.email; 	   // Save email from	request to User object
		user.password = req.body.password; // Save password from request to User object	
		user.name = req.body.name;	
		user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});

		if (req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '' || req.body.name == null || req.body.name == '') {
			res.json({ success: false, message: 'Ensure username, email, and password were provided' });
		} else {
			user.save(function (err){
				if(err){	
					// Check if any validation errors exist (from user model)	
					if (err.errors != null) {
						if (err.errors.name) {
							res.json({ success: false, message: err.errors.name.message }); // Display error in validation (name)
						} else if (err.errors.email) {
							res.json({ success: false, message: err.errors.email.message }); // Display error in validation (email)
						} else if (err.errors.username) {
							res.json({ success: false, message: err.errors.username.message }); // Display error in validation (username)
						} else if (err.errors.password)	{
							res.json({ success: false, message: err.errors.password.message }); // Display error in validation (password)
						} else {
							res.json({ success: false, message: err}); // Display any other errors with validation
						}
					} else if (err) {
						if (err.code == 11000) {
							if (err.errmsg[51] == "u") {
								res.json({ success: false, message: 'That username is already taken'});	// Disply error if username already taken
							} else if (err.errmsg[51] == "e") {
								res.json({ success: false, message: 'That e-mail is already taken'}); // Display error if e-mail already taken
							}
						} else {
							res.json({ success: false, message: err });
						}
					}
				} else {

					var email = {
					  from: 'Localhost Staff, awesome@bar.com',
					  to: user.email,
					  subject: 'Localhost Activation Link',
					  text: 'Hello ' + user.name + ', Thank you for registering at localhost.com. Please click on the following link below to complete your activation: http://101.53.131.119:8001/activate/' + user.temporarytoken,
					  html: 'Hello<strong> ' + user.name + '</strong>, <br><br> Thank you for registering at localhost.com. Please click on the link below to complete your activation:<br><br><a href="http://101.53.131.119:8001/activate/' + user.temporarytoken + '">http://101.53.131.119:8001/activate/</a>'
					};

					client.sendMail(email, function(err, info){
					    if (err){
					      console.log(err);
					    }
					    else {
					      console.log('Message sent: ' + info.response);
					    }
					});

					res.json({ success: true, message: 'Account registered! please check your e-mail for activation link.' });
				}
			});
		}
	});

	router.post('/checkusername', function (req, res) {
		User.findOne({ username: req.body.username }).select('username').exec(function (err, user) {
			if (err) throw err;

			if (user) {
				res.json({ success: false, message: 'The username is already taken' });
			} else {
				res.json({ success: true, message: 'valid username' });
			}
		});
	});

	router.post('/checkemail', function (req, res) {
		User.findOne({ email: req.body.email }).select('email').exec(function (err, user) {
			if (err) throw err;

			if (user) {
				res.json({ success: false, message: 'The e-mail is already taken' });
			} else {
				res.json({ success: true, message: 'valid e-mail' });
			}
		});
	});

	router.put('/activate/:token', function (req, res) {
		User.findOne({ temporarytoken: req.params.token }, function (err, user) {
			if (err) throw err;

			var token = req.params.token;

			jwt.verify(token, secret, function (err, decoded) {
			  if (err) {
			  	res.json({ success: false, message: 'Activation link has expired' }); // Token has expired or is invalid
			  } else if (!user) {
			  	res.json({ success: false, message: 'Activation link has expired' });
			  } else {
				  	user.temporarytoken = false;
				  	user.active = true;
				  	user.save(function (err) {
				  		if (err) {
				  			console.log(err);
				  		} else {

				  			// if save succeeds, create e-mail object
				  			var email = {
							  from: 'Localhost Staff, awesome@bar.com',
							  to: user.email,
							  subject: 'Localhost Account Activated',
							  text: 'Hello ' + user.name + ', Your Account has been Successfully Activated!',
							  html: 'Hello<strong> ' + user.name + '</strong>,<br><br>Your Account has been Successfully Activated!'
							};

							// send e-mail object to user
							client.sendMail(email, function(err, info){
							    if (err){
							      console.log(err);
							    }
							    else {
							      console.log('Message sent: ' + info.response);
							    }
							});
				  			res.json({ success: true, message: 'Account activated' });
				  		}
				  	});
			  	}
			});
		});
	});

	// Route for user login
	//http://localhost:8080/api/authenticate
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username}).select('email username password active').exec(function(err, user){
			if (err) throw err; // Throw error if cannot connect

			// Check if user is found in the database (based on username)
			if(!user){
				res.json({ success: false, message: 'Username not found'}); // Username not found in database
			} else if (user) {
				// Check if user does exist, then compare password provided by user
				if (!req.body.password) {
					res.json({ success: false, message: 'No password provided'}); // password not provided
				} else {
					var validPassword = user.comparePassword(req.body.password); // Check if password matchs password provided by user								
					if(!validPassword){
						res.json({ success: false, message: 'Could not authenticate password'}); // Password does not match password in database
					} else if (!user.active) {
						res.json({ success: false, message: 'Account is not yet activated, Please check your email for activation Link', expired: true }); // Account is not activated
					} else {
						var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '30s' }); // Logged in: Give user token
						res.json({ success: true, message: 'User Authenticate Successfully!', token: token }); // Return token in JSON object to controller
					}
				}	
			}
		});
	});


	router.post('/resend', function (req, res) {
		User.findOne({ username: req.body.username}).select('username password active').exec(function (err, user) {
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: 'Could not authenticate User' });
			} else if (user) {
				if (req.body.password) {
					var validPassword = user.comparePassword(req.body.password);
					if (!validPassword) {
						res.json({ success: false, message: 'Could not authenticate password' });
					} else if (user.active) {
						res.json({ success: false, message: 'Account is already activated' });
					} else {
						res.json({ success: true, user: user });
					}
				} else {
					res.json({ success: false, message: 'No password provided' });
				}				
			}
		});
	});

	router.put('/resend', function (req, res) {
		User.findOne({ username: req.body.username}).select('username name email temporarytoken').exec(function (err, user) {
			if (err) throw err;

			user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});
			user.save(function (err) {
				if (err) {
					console.log(err);
				} else {

					// If user successfully saved to database, create e-mail object
					var email = {
					  from: 'Localhost Staff, awesome@bar.com',
					  to: user.email,
					  subject: 'Localhost Activation Link Request',
					  text: 'Hello ' + user.name + ', You recently requested a new account activation link. Please click on the following link below to complete your activation: http://101.53.131.119:8001/activate/' + user.temporarytoken,
					  html: 'Hello<strong> ' + user.name + '</strong>, <br><br> You recently requested a new account activation link. Please click on the link below to complete your activation:<br><br><a href="http://101.53.131.119:8001/activate/' + user.temporarytoken + '">http://101.53.131.119:8001/activate/</a>'
					};

					// Function to send e-mail to user
					client.sendMail(email, function(err, info){
					    if (err){
					      console.log(err); // If error in sending e-mail, log to console/terminal
					    }
					    else {
					      console.log('Message sent: ' + info.response);
					    }
					});
					// Return success message to controller
					res.json({ success: true, message: 'Activation link has been sent to ' + user.email + '!' });
				}
			});
		})
	});

	router.put('/resetpassword', function (req, res) {
		User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function (err, user){
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: 'Username was not found' });
			} else if (!user.active) {
				res.json({ success: false, message: 'Account has not yet been activated' });
			} else {
				user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});
				user.save(function (err) {
					if (err) {
						res.json({ success: false, message: err });
					} else {

						var email = {
						  from: 'Localhost Staff, awesome@bar.com',
						  to: user.email,
						  subject: 'Localhost Reset Password Request',
						  text: 'Hello ' + user.name + ', You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://101.53.131.119:8001/reset/' + user.resettoken,
						  html: 'Hello<strong> ' + user.name + '</strong>, <br><br>You recently request a password reset link. Please click on the link below to reset your password:<br><br><a href="http://101.53.131.119:8001/reset/' + user.resettoken + '">http://101.53.131.119:8001/reset/</a>'
						};

						client.sendMail(email, function(err, info){
						    if (err){
						      console.log(err);
						    }
						    else {
						      console.log('Message sent: ' + info.response);
						    }
						});
						res.json({ success: true, message: 'please check your e-mail for password reset link' });
					}
				});
			}
		});
	});

	router.get('/resetpassword/:token', function (req, res) {
		User.findOne({ resettoken: req.params.token}).select().exec(function (err, user) {
			if (err) throw err;

			var token = req.params.token;
			// Function to verify token
			jwt.verify(token, secret, function (err, decoded) {
			  if (err) {
			  	res.json({ success: false, message: 'Password link has expired' });
			  } else {
			  	if (!user) {
			  		res.json({ success: false, message: 'Password link has expired' });
			  	} else {
			  		res.json({ success: true, user: user});
			  	}
			  }
			});
		});
	});

	router.put('/savepassword', function (req, res) {
		User.findOne({ username: req.body.username }).select('username email password resettoken name').exec(function (err, user) {
			if (err) throw err;

			if (req.body.password == null || req.body.password == ''){
				res.json({ success: false, message: 'Password not provided' });
			} else {
				user.password = req.body.password;
				user.resettoken = false;
				user.save(function (err) {
					if (err) {
						res.json({ success: false, message: err });
					} else {
						var email = {
						  from: 'Localhost Staff, awesome@bar.com',
						  to: user.email,
						  subject: 'Linkocalhost Reset Password',
						  text: 'Hello ' + user.name + ', This e-mail is to notify you that your password was recently reset at localhost.com',
						  html: 'Hello<strong> ' + user.name + '</strong>, <br><br>This e-mail is to notify you that your password was recently reset at localhost.com'
						};

						client.sendMail(email, function(err, info){
						    if (err){
						      console.log(err);
						    }
						    else {
						      console.log('Message sent: ' + info.response);
						    }
						});
						res.json({ success: true, message: 'password has been reset' });
					}
				});
			}
		});
	});

	// Middleware for Routes that checks for token - place all routes after this route that require the user to already be logged in
	router.use(function (req, res, next){
		var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

		// Check if token is valid and not expired
		if (token) {
			// Function to verify token
			jwt.verify(token, secret, function (err, decoded) {
			  if (err) {
			  	res.json({ success: false, message: 'Token Invalid!..'}); // Token has expired or is invalid
			  } else {
			  	req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
			  	next(); // Required to leave middleware
			  }
			});
		} else {
			res.json({ success: false, message: 'No token provided'}); // Return error if no token provided in the request
		}
	});

	// Route to get the currently logged in user
	router.post('/me', function (req, res){
		res.send(req.decoded); // Return the token acquires from middleware
	});

	router.get('/renewToken/:username', function (req, res) {
		User.findOne({ username: req.params.username}).select().exec(function (err, user) {
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: 'No user was found' });
			} else {
				var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h'});
				res.json({ success: true, token: newToken });		
			}
		});
	});


	router.get('/permission', function (req, res) {
		User.findOne({ username: req.decoded.username }, function (err, user) {
			if (err) throw err;

			if (!user) {
				res.json({ success: false, message: 'No user found' });
			} else {
				res.json({ success: true, permission: user.permission });
			}
		});
	});

	router.get('/management', function (req, res) {
		User.find({}, function (err, users) {
			if (err) throw err;

			User.findOne({ username: req.decoded.username }, function (err, mainUser) {
				if (err) throw err;

				if (!mainUser) {
					res.json({ success: false, message: 'No User found' });
				} else {
					if (mainUser.permission === 'admin') {
						if (!users) {
							res.json({ success: false, message: 'Users not found' });
						} else {
							res.json({ success: true, users: users, permission: mainUser.permission });
						}

					} else {
						res.json({ success: false, message: 'Insufficient permission' });
					}
				}
			});
		});
	});


	router.delete('/management/:username', function (req, res) {
		var deletedUser = req.params.username;

		User.findOne({ username: req.decoded.username }, function (err, mainUser) {
			if (err) throw err;

			if (!mainUser) {
				res.json({ success: false, message: 'No user found' });
			} else {
				if (mainUser.permission !== 'admin') {
					res.json({ success: false, message: 'Insufficient permission' });
				} else {
					User.findOneAndRemove({ username: deletedUser}, function (err, user) {
						if (err) throw err;
						res.json({ success: true });
					});
				}
			}
		});
	});

	router.get('/edit/:id', function (req, res) {
		var editUser = req.params.id;

		User.findOne({ username: req.decoded.username}, function (err, mainUser) {
			if (err) throw err;

			if (!mainUser) {
				res.json({ success: false, message: 'No user found' });
			} else {
				if (mainUser.permission === 'admin') {

					User.findOne({ _id: editUser }, function (err, user) {
						if (err) throw err;

						if (!user) {
							res.json({ success: false, message: 'No user found' });
						} else {
							res.json({ success: true, user: user });
						}
					});
				} else {
					res.json({ success: false, message: 'Insufficient permission' });
				}
			}
		});
	});

	router.put('/edit', function (req, res) {
		var editUser = req.body._id;

		if (req.body.name) var newName = req.body.name;
		if (req.body.username) var newUsername = req.body.username;
		if (req.body.email) var newEmail = req.body.email;
		if (req.body.permission) var newPermission = req.body.permission;

		User.findOne({ username: req.decoded.username }, function (err, mainUser) {
			if (err) throw err;

			if (!mainUser) {
				res.json({ success: false, message: 'no user found' });
			} else {
				if (newName) {
					if (mainUser.permission === 'admin') {
						User.findOne({ _id: editUser}, function (err, user){
							if (err) throw err;

							if (!user) {
								res.json({ success: false, message: 'No user found' });
							} else {
								user.name = newName;
								user.save(function (err) {
									if (err) {
										console.log(err);
									} else {
										res.json({ success: true, message: 'Name has been updated!' });
									}
								});
							}
						});
					} else {
						res.json({ success: false, message: 'Insufficient permission' });
					}
				}

				if (newUsername) {
					if (mainUser.permission === 'admin') {
						User.findOne({ _id: editUser}, function (err, user) {
							if (err) throw err;

							if (!user) {
								res.json({ success: false, message: 'No user found' });
							} else {
								user.username = newUsername;
								user.save(function (err) {
									if (err) {
										console.log(err);
									} else {
										res.json({ success: true, message: 'Username has been updated!' });
									}
								});
							}
						});
					} else {
						res.json({ success: false, message: 'Insufficient permission' });
					}
				}

				if (newEmail) {
					if (mainUser.permission === 'admin') {
						User.findOne({ _id: editUser}, function (err, user) {
							if (err) throw err;

							if (!user) {
								res.json({ success: false, message: 'No user found' });
							} else {
								user.email = newEmail;
								user.save(function (err) {
									if (err) {
										console.log(err);
									} else {
										res.json({ success: true, message: 'E-mail has been updated!' });
									}
								});
							}
						});
					} else {
						res.json({ success: false, message: 'Insufficient permission' });
					}		
				}

				if (newPermission) {
					if (mainUser.permission === 'admin') {
						User.findOne({ _id: editUser}, function (err, user) {
							if (err) throw err;

							if (!user) {
								res.json({ success: false, message: 'No user found' });
							} else {
								if (newPermission === 'user') {
									if (user.permission === 'admin') {
										if (mainUser.permission !== 'admin') {
											res.json({ success: false, message: 'Insufficient permission. You must be an admin to downgrade another admin' });
										} else {
											user.permission = newPermission;
											user.save(function (err) {
												if (err) {
													console.log(err);
												} else {
													res.json({ success: true, message: 'Permission have been updated!' });
												}
											});
										}
									} else {
										user.permission = newPermission;
										user.save(function (err) {
											if (err) {
												console.log(err);
											} else {
												res.json({ success: true, message: 'Permission have been updated!' });
											}
										});
									}
								}

								if (newPermission === 'admin') {
									if (user.permission === 'user') {
										user.permission = newPermission;
										user.save(function (err) {
											if (err) {
												console.log(err);
											} else {
												res.json({ success: true, message: 'Permission have been updated!' });
											}
										});
									} else {
										res.json({ success: false, message: 'Insufficient Permission. You must be an admin to upgrade someone to the admin leave' });
									}
								}
							}
						});
					} else {
						res.json({ success: false, message: 'Insufficient permission' });
					}		
				}
			}
		});
	});

	// Router to get twitter timeline information from specified account
	router.get('/twittertimeline', tweets.timeline);

	router.get('/tweetscount', tweets.tweetscount);

	router.get('/getbarchartdata', tweets.getbarchartdata);

	router.get('/getmodelchartdata', tweets.getmodelchartdata);

	router.get('/getmodelbarchart', tweets.getmodelbarchart);

	// Router to crawl tweets from twitter
	router.post('/tweetcrawler', tweets.tweetcrawl);

	// Router to fetch tweets from tweet table for tweet Preview
	router.get('/tweets', tweets.tweetspreview);

	router.post('/tweet', tweets.tweet);

	router.post('/retweet', tweets.retweet);

	router.post('/favorites', tweets.favorites);

	return router;
}