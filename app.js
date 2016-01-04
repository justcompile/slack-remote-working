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

  if (!message || !/(office|remote)/i.test(message)) {
    res.send({text: 'You must specify either `office` or `remote` as your location. It makes my life easier :)'});
  }

  cache[username] = {
    location: message.toLowerCase(),
    updated: new Date()
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
    var officeUsers = [], remoteUsers = [];

    var messageLines = [];

    Object.keys(cache).forEach(function(username) {
      var user = cache[username];
      if (user.location === 'office') {
        officeUsers.push({name: username, updated: user.updated});
      } else {
        remoteUsers.push({name: username, updated: user.updated});
      }
    });

    messageLines.push('*Those in the office:*');
    if (officeUsers.length) {
      officeUsers.forEach(function(user) {
        messageLines.push('- ' + user.name + ' as of ' + user.updated);
      });
    } else {
      messageLines.push('- None\n');
    }

    messageLines.push('*Those working remotely:*');

    if (remoteUsers.length) {
      remoteUsers.forEach(function(user) {
        messageLines.push('- ' + user.name + ' as of ' + user.updated);
      });
    } else {
      messageLines.push('- None');
    }

    responseObject.text = messageLines.join('\n');
  } else {
    var user = cache[entityToFind];
    if (!user) {
      responseObject.text = 'Could not find any location information for ' + entityToFind;
    } else {
      responseObject.text = '`'+username + '`\'s location: ' + user.location + ' as of ' + user.updated;
    }
  }

  res.send(responseObject);
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
