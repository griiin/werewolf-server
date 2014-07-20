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
    dbname: 'werewolf-test-0005',
    dbhost: '127.0.0.1',
    dbport: 27017,
    socketport: 4253,
    displayTime: false,
    verbose: settings ? !!settings.verbose : false,
    debug: settings ? !!settings.debug : false
  };

  this.server = new Server(this.options);
  this.server.start();

  // this.cleanDB();

  return { server: this.server, options: this.options };
}, serverHelper.prototype);

serverHelper.prototype.clearAll = _.bind(function () {
  var done = false;
  runs(_.bind(function() {
    this.server.stop();
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

serverHelper.prototype.cleanDB = _.bind(function () {
  var deferred = Q.defer();

  // clear db
  var easyMongo = require('easymongo');
  var mongo = new easyMongo({
    dbname: this.options.dbname,
    host: this.options.dbhost,
    port: this.options.dbport
  });
  // clear users collection
  var users = mongo.collection('users');
  users.remove(function(results, err) {
    deferred.resolve();
  });
  mongo.close();

  return deferred.promise;
}, serverHelper.prototype);



module.exports = function () {
  return new serverHelper();
};
