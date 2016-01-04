var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    MongoService = require('./libs/mongoService');

var app = express();
    mongoService = new MongoService(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/storystream-slack');

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

  mongoService.updateUserLocation(username, message.toLowerCase(), function(err, result) {
    if (err) {
      res.send('Unable to set location');
    } else {
      res.send('Thanks. Have a great day!');
    }
  });
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

    mongoService.getAllUsers(function(err, docs) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      docs.forEach(function(user) {
        if (user.location === 'office') {
          officeUsers.push({name: user.username, updated: user.updated});
        } else {
          remoteUsers.push({name: user.username, updated: user.updated});
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

      res.send(responseObject);
    });
  } else {
    mongoService.getUser(entityToFind, function(err, user) {
      if (!user) {
        responseObject.text = 'Could not find any location information for ' + entityToFind;
      } else {
        responseObject.text = '`'+user.username + '`\'s location: ' + user.location + ' as of ' + user.updated;
      }

      res.send(responseObject);
    });
  }
});

var server = http.createServer(app);

mongoService.init(function() {
  server.listen(app.get('port'), function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening on port', app.get('port'));
  });
})

// Tidy up connections on close or exit

process.on('exit', function () {
    console.log('Exiting ...');
    if (null != mongoService) {
        mongoService.close(true, function(){
          console.log('bye');
        });
    }
    // close other resources here
    console.log('bye');
});

// happens when you press Ctrl+C
process.on('SIGINT', function () {
    console.log( '\nGracefully shutting down from  SIGINT (Crtl-C)' );
    process.exit();
});

// usually called with kill
process.on('SIGTERM', function () {
    console.log('Parent SIGTERM detected (kill)');
    // exit cleanly
    process.exit(0);
});
