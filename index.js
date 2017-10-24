var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// set up bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// set up mongoose
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/Graduateds';
mongoose.connect(uristring, function(err, res) {
  if (err) {
    console.log("ERROR connecting to: " + uristring + ". " + err);
  } else {
    console.log("Successfully connected to: " + uristring);
  }
});


// models
var messageSchema = new mongoose.Schema({
  message: { type: String },
  from: { type: String }
});

var recipientSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  photo: { type: String, trim: true },
  code: { type: String, trim: true },
  messages: [messageSchema]
});

var Recipient = mongoose.model('Recipients', recipientSchema);

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

app.get('/recipient', function(request, response) {
  Recipient.find({}).exec(function(err, result) {
    if (!err) {
      response.render('pages/recipient', {results: result});
    } else {
      console.log('Error on query!');
    };
  });
});

app.get('/recipient/create', function(request, response) {
  response.render('pages/recipient-create');
});

app.post('/recipient', function(request, response) {
  var name = request.body.name,
      photo = request.body.photo,
      code = request.body.code;

  var recipient = new Recipient({
    name: name,
    photo: photo,
    code: code
  });

  recipient.save(function(err) {
    if (!err) {
      response.redirect('/recipient');
    } else {
      console.log('Error on save!');
    }
  });
});

app.get('/message', function(request, response) {
  Recipient.find({}).exec(function(err, result) {
    if (!err) {
      response.render('pages/message-create', {recipients: result});
    } else {
      console.log('Error on query!');
    }
  });
});

app.post('/messageok', function(request, response) {
  var message = request.body.message,
      from = request.body.from,
      id = request.body.recipient;

  Recipient.findById(id, function(err, recipient) {
    if (!err) {
      recipient.messages.push({
        message: message,
        from: from
      });

      recipient.save(function(err) {
        if (!err) {
          response.redirect('/recipient');
        } else {
          console.log('Error on save!');
        }
      });
    } else {
      console.log('not found');
    }
  });

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
