var express = require('express'),
    bodyParser = require('body-parser');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var cache = {};

app.post('/set-location', function(req, res) {
  var username = '@'+req.body.user_name;
  var message = req.body.text;

  cache[username] = {
    location: message,
    updated: Date.now()
  };

  res.send('Thanks. Have a great day!');
});

app.get('/locate', function (req, res) {
  var entityToFind = req.query.text;

  var responseObject = {
    text: ''
  };

  if (!entityToFind) {
    responseObject.text = 'You need to specify a `@username` or use `everyone` in order for me to find who you are looking for...';
  } else if (entityToFind.toLowerCase() === 'everyone') {
    var messageLines = [];

    Object.keys(cache).forEach(function(username) {
      var user = cache[username];
      messageLines.push('`'+username + '` is working ' + user.location + ' today (' + user.updated + ')');
    });

    responseObject.text = messageLines.join('\n');
  } else {
    var user = cache[entityToFind];
    if (!user) {
      responseObject.text = 'Could not find any location information for ' + entityToFind;
    } else {
      responseObject.text = '`'+username + '` is working ' + user.location + ' today (' + user.updated + ')';
    }
  }

  res.send(responseObject);
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
