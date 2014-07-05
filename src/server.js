var _ = require('lodash');
var log = require('./misc/log.js')();

var server = function(options) {
  this.settings = options;
  this.clients = [];
};

server.prototype.start = function () {
  log.info("Starting server");
  this.initializeDb();
  this.startSocketServer();
};

server.prototype.stop = function () {
  log.info("Stoping server");
  _(this.clients).forEach(function(client) {
    client.disconnect();
  });
  this.http.close();
};

server.prototype.initializeDb = function () {
  log.info("Initializing database");
  var easyMongo = require('easymongo');
  this.mongo = new easyMongo({
    dbname: this.settings.dbname,
    host: this.settings.dbhost,
    port: this.settings.dbport
  });
};

server.prototype.startSocketServer = function () {
  log.info("Starting socket.io server");
  this.app = require('express')();
  this.http = require('http').Server(this.app);
  this.io = require('socket.io')(this.http);

  this.io.on('connection', _.bind(this.onClientConnection, this));

  this.http.listen(this.settings.socketport, function(){
    log.info('listening on *:3000');
  });
  this.clients = [];
};

server.prototype.onClientConnection = function (socket) {
  log.info("One user is connected");
  this.clients.push(socket);
  socket.on('sign_up', function(data) {
    require('./userConnection/signUp').signUp(data, socket, this.mongo);
  });
  socket.on('ping', function (data) {
    socket.emit('pong', null);
  });
};

module.exports = server;
