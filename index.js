var express = require('express');
var app = express();
var path = require('path');
app.get('/', function(req, res)	{
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(1338);

console.log('Come find me at http://localhost:1338');