/*This is a sample API for a CRM.
	Only users have been included.
	Author: Chukwuemeka Onyenezido*/

// BASE SETUP
// ==============================================

// CALL OUR NODE PACKAGES
var express = require('express'); // call express for routing
var bodyParser = require('body-parser'); // call body-parser for reading the headers of POST requests
var morgan = require('morgan'); // call morgan for logging requests to the console for debugging purposes
var mongoose = require('mongoose'); // call mongoose for connecting with our mongodb database
var jwt = require('jsonwebtoken'); // call jsonwebtoken for token based authentication
var port = process.env.PORT || 8080; // set the port for our API
var path = require('path');

// Create our secret passphrase for token
var superSecret = 'RjssfrkC9Nnx7u45DsqmhZxVDR3YZWGE6CHhvy4X9HkTCamvZqpmNL3pJt9UArMKckbfmkAXJQuPTnTNhNkVJuPEhPdaFR75y9P6j7tuTAtVLucnEW8DBDeK'

// Import our user model
var User = require('./app/model/user.js');

// connect to our database
mongoose.connect('mongodb://localhost:27017/userDatabase');

// APP configuration
// Define our app using Express
var app = express();
// Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Configure our app to handle cross domain - CORS - requests
app.use(function(req, res, next)	{
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
		Authorization');
	next();
})

// Log all requests to the console for debugging purposes
app.use(morgan('dev'));

// ROUTES FOR OUR API
// ==============================================

// Basic route for the homepage - GET http://localhost:8080
var homeRouter = express.Router();
homeRouter.get('/', function(req, res)	{
	res.sendFile(path.join(__dirname + '/index.html'));
});

homeRouter.get('/js/app.js', function(req, res)	{
	res.sendFile(path.join(__dirname + '/js/app.js'));
});

// Main api route
var apiRouter = express.Router();

// Authentication and tokenization route accessed at POST http://localhost:8080/authenticate
apiRouter.post('/authenticate', function(req, res)	{
	// Find the user
	// Select a user, specifying the password explicitly so the database returns it
	User.findOne({username: req.body.username}).select('name username password').exec(function(err, user)	{
		// Unknown errors
		if (err) throw err;
		// No user with that username was found
		if (!user)	{
			res.json({success: false, message: 'Authentication failed, user not found'});
		}
		else if (user)	{
			var validPassword = user.comparePassword(req.body.password);
			// Password is wrong
			if (!validPassword)	{
				res.json({success: false, message: 'Authentication failed, wrong passord'});
			}
			else	{
				// Password is correct
				// Create a token
				var token = jwt.sign({name: user.name, username: user.username}, superSecret, {expiresInMinutes: 1440}); // expires in 24 hours

				// Send the token
				res.json({
					success: true,
					message: 'User authenticated successfully',
					token: token
				});
			}
		}
	});
})

// Middleware for our API route
apiRouter.use(function(req, res, next)	{
	// Verifying the token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	if (token)	{

		//Verify the token
		jwt.verify(token, superSecret, function(err, decoded)	{
			// Wrong token
			if (err)	{
				res.status(403).send({success: false, message: 'Failed to authenticate token, incorrect or expired token'});
			}
			else	{
				// If everything is good pass on to other routes
				req.decoded = decoded;

				next();
			}
		})
	}
	else
		// no token
	res.status(403).send({success: false, message: 'No token provided'});

	console.log('Somebody just called our API with ' + req.method + req.url);
});

apiRouter.get('/', function(req, res)	{
	res.json({ message: 'Welcome to our API!'});
});

apiRouter.get('/me', function(req, res)	{
	res.send(req.decoded);
});

// More api routes to be added here
// On routes that end with /users - used to chain http actions get post etc.
apiRouter.route('/users')
	// Create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res)	{
		// Create a new instance of the user model
		var user = new User();
		// Set the users information from the request
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;
		// Save the user and check for errors
		user.save(function(err)	{
			if (err) {
				// Duplicate entry
				if (err.code == 11000)	{
					return res.json({success: false, message: 'A user with that username already exists!'});
				}
				else	{
					return res.send(err);
				}
			}
			res.json({message: 'User created successfully!'})
		});
	})
	// Get all the users
	.get(function(req, res)	{
		User.find(function(err, users)	{
			if (err)	res.send(err);
			//return the users
			res.json(users);
		});
	});

apiRouter.route('/users/:user_id')
	// Get user with the user id specified
	.get(function(req, res)	{
		User.findById(req.params.user_id, function(err, user)	{
			if (err) res.send(err);
			// Return the user with the id
			res.json(user);
		});
	})
	// Update a user's details using his specified id
	.put(function(req, res)	{
		// Use our model to find the user
		User.findById(req.params.user_id, function(err, user)	{
			if (err) res.send(err);

			// Make sure the user details are not NULL or empty before saving
			if (req.body.name) user.name = req.body.name;
			if (req.body.username) user.username = req.body.username;
			if (req.body.password) user.password = req.body.password;

			user.save(function(err)	{
				if (err) res.send(err);
				// Return a message
				res.send({message: 'User updated successfully!'});
			});
		});
	})
	// Delete a user with a specified id
	.delete(function(req, res)	{
		// Remove the user
		User.remove({_id: req.params.user_id}, function(err, user)	{
			if (err) return res.send(err);

			// Send a message
			res.send({message: 'User successfully deleted!'});
		});
	});

// REGISTER OUR ROUTES
// ==============================================
// Homepage
app.use('/', homeRouter);
// API
app.use('/api', apiRouter);

// START THE SERVER
// ==============================================
app.listen(port);
console.log('Come find me at ' + port);
