var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;


var MongoService = function(connectionString) {
	this.connectionString = connectionString;
  this.db = null;
  this.debug = false;
};

MongoService.prototype.init = function(callback) {
  var self = this;

	MongoClient.connect(self.connectionString, function(err, db) {
    self.db = db;
    callback();
	});
};

MongoService.prototype.getUser = function(username, callback) {
  var col = this.db.collection('user-locs');

  col.findOne({username: username}, {fields:{_id:0}}, function(err, doc) {
    if (err) {
      callback(err);
    } else {
      callback(null, doc);
    }
  });
};

MongoService.prototype.getAllUsers = function(callback) {
  var col = this.db.collection('user-locs');

  col.find({}).sort([['location', 1]]).toArray(function(err, docs) {
    if (err) {
      callback(err);
    } else {
      callback(null, docs);
    }
  });
};


MongoService.prototype.updateUserLocation = function (username, location, callback) {
  var col = this.db.collection('user-locs');

  col.updateOne({username: username}, {$set: {location: location, updated: new Date()}}, {
      upsert: true
    }, function(err, r) {
      if (err) {
        callback(err);
      } else {
        callback(null, 'ok');
      }
    });
};


MongoService.prototype.close = function(forceClose, callback) {
  this.db.close(forceClose, callback);
};

MongoService.prototype.log = function() {
  if (this.debug) {
    console.log(Array.prototype.slice.call(arguments));
  }
};


module.exports = MongoService;
