var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

var cache = {};

app.post('/set-location', function(req, res) {
  console.log(req.body);
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
    var users = ['dave', 'mike', 'sally'];

    var messageLines = [];
    users.forEach(function(user) {
      messageLines.push('@'+user+' is working from home today');
    });

    responseObject.text = messageLines.join('\n');
  } else {
    responseObject.text = entityToFind + ' is working in the office today';
  }

  res.send(responseObject);
});

var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
