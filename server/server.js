var express = require('express'),
app = express(),
http = require('http'),
session = require('express-session'),
path = require('path'),
favicon = require('serve-favicon'),
ejs = require('ejs'),
fs = require('fs');

const port = process.env.PORT || 80; // Default port is 80, use a diffrent one if specified

const key = process.env.KEY || fs.readFileSync(path.join(__dirname, '/../token.txt'), 'utf8', function(err, data){ if(err){throw err} }).replace(/\s+/g,''); // If specified, use a key given by the env variable, otherwise read from token.txt

app.use(favicon(path.join(__dirname, '/../site', 'favicon.ico'))) // Handle the favicon in the most lazy way possible
app.use(express.static(path.join(__dirname + '/../site'))); // Set /site folder as holder of its static content
app.set('trust proxy', 1) // Trust first proxy
app.use(session({
  secret: 'SECRET KEY GOES HERE', // Secret key to create the hash for our session
  name: 'Steam Pile of Shame', // Name for the cookie
  resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request.
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store. (A session is uninitialized when it is new but not modified.)
                          // Setting saveUnitialized to false may help with performance in some cases and helps with laws requiring to ask permission to use cookies.
  cookie: { secure: false } // Secure cookies will not be sent back by compiant clients if the connection with the server isnt https
}));
app.set('views', path.join(__dirname, '../views')); // Render pages fromt he /views folder
app.set('view engine', 'ejs'); // Use ejs for rendering pages

var httpserver = http.createServer(app).listen(port); // Bind the server (http only, no https) to a var for possible use later

console.log('Listening on port ', port);

app.get('/', function(req, res, next){
  res.render('index');
});

app.get('/user/:uid', function(req, res, next){
	http.get({
		hostname:'api.steampowered.com',
		port: 80,
		path: '/IPlayerService/GetOwnedGames/v0001/?key=' + key + '&steamid=' + req.params.uid + '&include_appinfo=1',
		agent: false
	}, (data) => {
		var body = "";
		data.on('data', function(chunk){
			body += chunk;
		});
		data.on('end', function(){
			response = JSON.parse(body).response;
			res.render('user', response);
		})
	});

});
