var config = require('../config'),
    Slack = require('slack-node')
    mongoService = require('./mongoService')().mongoService;

var SlackAccessLog = function() {
  this.token = config.slackWebAPIToken;
  this.client = new Slack(this.token);
};

SlackAccessLog.prototype.findUser = function (userId, callback) {
  this.client.api("team.accessLogs", function(err, response) {
    if (err) {
      callback(err);
      return;
    }

    var userRecord;

    response.logins.some(function(record) {
      if (record.user_id === userId) {
        userRecord = record;
        return true;
      }
      return false;
    });

    if (!userRecord) {
      callback({message: 'User ' + userId + ' was not found'});
    } else {
      callback(null, userRecord);
    }
  });
};

var accessLog = new SlackAccessLog();

module.exports = function(data) {
  // if data is empty, the bot user is the one who has triggered the event
  // or the message type isn't 'presence_change' then ignore
  if (!data || data.user === config.botId) return;

  accessLog.findUser(data.user, function(err, userRecord) {
    if (err) {
      console.error(err);
      return;
    }

    // if connected via phone, we're not interested
    if (!/^SlackWeb/i.test(userRecord.user_agent)) {
      return;
    }

    var location = userRecord.ip === config.officeIp ? 'office' : 'remote';

    mongoService.updateUserLocation('@' + userRecord.username, location, data.presence, new Date(userRecord.date_last*1000), function(err, resp) {
      if (err) {
        console.error(err);
      } else {
        console.log('Updated location and status for', userRecord.username);
      }
    });
  });
};
