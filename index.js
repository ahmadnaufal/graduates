var cool = require('cool-ascii-faces');
var pg = require('pg');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// set up bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/message', function(request, response) {
  var code = request.body.messageCode;
  response.render('pages/message', {code: code});
});

app.get('/create', function(request, response) {
  response.render('pages/create');
});

app.post('/create', function(request, response) {
  var message = request.body.message,
      recipient = request.body.recipient,
      code = request.body.code;
  response.send(message + " " + recipient + " " + code);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
