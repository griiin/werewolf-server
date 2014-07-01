var _ = require('lodash');
var log = require('./misc/log.js')();

var server = function(options) {
  this.settings = options;
};

server.prototype.run = function () {
  log.info("Starting server");
  this.initializeDb();
  this.startSocketServer();
};

server.prototype.initializeDb = function () {
  log.info("Initializing database");
  var easyMongo = require('easymongo');
  var mongo = new easyMongo({
    dbname: this.settings.dbname,
    host: this.settings.dbhost,
    port: this.settings.dbport
  });
};

server.prototype.startSocketServer = function () {
  log.info("Starting socket.io server");
  this.io = require('socket.io').listen(this.settings.socketport);
  this.io.on('connection', this.onClientConnexion);
};

server.prototype.onClientConnexion = function (socket) {
  log.info("One user is connected");
  socket.on('ping', function (data) {
    socket.emit('pong', null);
  });
};

module.exports = server;
