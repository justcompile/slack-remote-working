var express = require('express')
    router = express.Router(),
    mongo = require('../libs/mongoService')(),
    mongoService = mongo.mongoService;

router.post('/set-location', function(req, res) {
  res.send('Thanks, but you don\'t need to do this anymore. I\'m full auto-magical now :)');
});

var formatDate = function(date) {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

router.get('/locate', function (req, res) {
  var entityToFind = req.query.text;

  var responseObject = {
    text: ''
  };

  if (!entityToFind || entityToFind.toLowerCase() === 'everyone') {
    var officeUsers = [], remoteUsers = [], satOfficeUsers = [];

    var messageLines = [];

    mongoService.getAllUsers(function(err, docs) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      docs.forEach(function(user) {
        if (user.location === 'office') {
          officeUsers.push({name: user.username, updated: user.updated, status: user.status});
        } else if (user.location === 'satellite office') {
          satOfficeUsers.push({name: user.username, updated: user.updated, status: user.status});
        } else {
          remoteUsers.push({name: user.username, updated: user.updated, status: user.status});
        }
      });

      messageLines.push('*Those in the office:*');
      if (officeUsers.length) {
        officeUsers.forEach(function(user) {
          var status = user.status || 'unset';
          messageLines.push('- ' + user.name + ' ('+ status +') as of ' + formatDate(user.updated));
        });
      } else {
        messageLines.push('- None\n');
      }

      messageLines.push('*Those in the satellite office:*');
      if (satOfficeUsers.length) {
        satOfficeUsers.forEach(function(user) {
          var status = user.status || 'unset';
          messageLines.push('- ' + user.name + ' ('+ status +') as of ' + formatDate(user.updated));
        });
      } else {
        messageLines.push('- None\n');
      }

      messageLines.push('*Those working remotely:*');

      if (remoteUsers.length) {
        remoteUsers.forEach(function(user) {
          var status = user.status || 'unset';
          messageLines.push('- ' + user.name + ' ('+ status +') as of ' + formatDate(user.updated));
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
        var status = user.status || 'unset';
        responseObject.text = '`'+user.username + '`\'s location: ' + user.location + ' ('+ status +') as of ' + formatDate(user.updated);
      }

      res.send(responseObject);
    });
  }
});

module.exports = router;
