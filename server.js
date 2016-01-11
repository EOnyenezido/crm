// Web app framework
var express = require('express');
// Main express app
var app = express();
var path = require('path');

// main homepage route, this is the silly way to create routes
// I replaced this with basic Router just to keep things streamlined
//app.get('/', function(req, res)	{
	//res.sendFile(path.join(__dirname + '/index.html'));
//});

// First basic route, using different instances of express.router is the cleanest way
var basicRouter = express.Router();

// Home page (http://localhost:1337)
basicRouter.get('/', function(req, res)	{
	res.sendFile(path.join(__dirname + '/index.html'));
});

// routes for the admin section
// get an instance of the router express mini app
var adminRouter = express.Router();

// adminRouter middleware - do this before a request is processed
// must be placed right after router declaration
adminRouter.use(function(req, res, next)	{
	// log the request type - get, post etc - and the url
	console.log('The user made a', req.method, 'request to the URL', req.url);
	//continue on with what we were doing and go to the route
	next();
})

// admin main page, the dashboard (http://localhost:1337/admin)
adminRouter.get('/', function(req, res)	{
	res.send('I am the dashboard!');
});

// users page (http://localhost:1337/admin/users)
adminRouter.get('/users', function(req, res)	{
	res.send('I show all the users!');
});

// Special route middleware to validate routes with parameter :name
adminRouter.param('name', function(req, res, next, name)	{
	//do validation on name here
	/*if (name != 'holly') {
		res.send('You are not authorized, gerrarahia mehn!');
		return;
	};*/
	//log something so we know it's working
	console.log('doing name validations on', name);
	// Once validation is done save the new item in the req
	req.name = name;
	//go to the next thing
	next();
})

// route with parameter - user's name - (http://localhost:1337/users/holly)
adminRouter.get('/users/:name', function(req, res)	{
	res.send('Hello ' + req.params.name + '!');
})

// posts page (http://localhost:1337/admin/posts)
adminRouter.get('/posts', function(req, res)	{
	res.send('I show all the posts');
});

// apply the routes to our application
app.use('/', basicRouter);
app.use('/admin', adminRouter);

//last way to create routes - directly from the express application instance
//may get a bit confusing if the code grows very large
app.route('/login')
	//the get part
	.get(function(req, res)	{
		res.sendFile(path.join(__dirname + '/login.html'));
	})
	//the post part
	.post(function(req, res)	{
		console.log('processing the login form');
		res.send('processing the login form, please wait...');
});

app.listen(1337);

console.log('Come find me at http://localhost:1337');