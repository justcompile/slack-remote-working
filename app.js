var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    slackAPI = require('slackbotapi'),
    config = require('./config'),
    mongo = require('./libs/mongoService')(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/storystream-slack'),
    routes = require('./routes'),
    slackEventHandler = require('./libs/slackEventHandler');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use('/', routes);

var server = http.createServer(app);

mongo.init(function() {
  server.listen(app.get('port'), function () {
    var host = server.address().address;
    var port = server.address().port;
  });

  // Starting
  var slack = new slackAPI({
      'token': config.slackRTMAPIToken,
      'logging': true,
      'autoReconnect': true
  });

  slack.on('presence_change', function (data) {
    slackEventHandler(data);
  });
});

// Tidy up connections on close or exit

process.on('exit', function () {
    console.log('Exiting ...');
    if (null != mongoService) {
        mongo.close(true, function(){
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
