var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();

var serverHelper = function () {

};

serverHelper.prototype.getConfiguredServer = _.bind(function (settings) {
  var Server = require('../../src/Server.js');

  // set spy
  var spy = settings ? settings.spyOn : false;
  if (spy) {
    spyOn(Server.prototype, spy).andCallThrough();
  }

  //
  this.options = {
    dbname: 'werewolf-test-0008',
    dbhost: '127.0.0.1',
    dbport: 27017,
    socketport: 4253,
    displayTime: false,
    verbose: settings ? !!settings.verbose : false,
    debug: settings ? !!settings.debug : false
  };

  this.server = new Server(this.options);
  this.server.start();

  this.cleanDB();

  // Set delayFactor to zero
  var Game = require('../../src/game/Game.js');
  Game.delayFactor = 0;

  return { server: this.server, options: this.options };
}, serverHelper.prototype);

serverHelper.prototype.clearAll = _.bind(function () {
  var done = false;
  runs(_.bind(function() {
    this.server.stop();
    this.clearProto();
    this.cleanDB()
    .then(function() {
      done = true;
    })
    .done();
  }, this));
  waitsFor(function () {
    return done;
  });
}, serverHelper.prototype);

serverHelper.prototype.clearProto = function () {
    // all werewolf so the game will finish instantly
    var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
    Werewolf.prototype.isAlive = true;
};

serverHelper.prototype.cleanDB = _.bind(function () {
  var deferred = Q.defer();

  // clear db
  if (!serverHelper.mongo) {
    var easyMongo = require('easymongo');
    serverHelper.mongo = new easyMongo({
      dbname: this.options.dbname,
      host: this.options.dbhost,
      port: this.options.dbport
    });
  }
  // clear users collection
  var users = serverHelper.mongo.collection('users');
  users.remove(function(results, err) {
    deferred.resolve();
  });

  // serverHelper.mongo.close();
  // serverHelper.mongo = undefined;

  return deferred.promise;
}, serverHelper.prototype);



module.exports = function () {
  return new serverHelper();
};
