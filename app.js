var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var serverPort = process.env.NODE_PORT || 3000;

var server = app.listen(serverPort, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
