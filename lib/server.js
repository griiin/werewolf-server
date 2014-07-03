var _ = require('lodash');
var log = require('./misc/log.js')();
var that;

var server = function(options) {
  that = this;
  that.settings = options;
  that.clients = [];
};

server.prototype.start = function () {
  log.info("Starting server");
  that.initializeDb();
  that.startSocketServer();
};

server.prototype.stop = function () {
  log.info("Stoping server");
  _(that.clients).forEach(function(client) {
    client.disconnect();
  });
  that.http.close();
};

server.prototype.initializeDb = function () {
  log.info("Initializing database");
  var easyMongo = require('easymongo');
  that.mongo = new easyMongo({
    dbname: that.settings.dbname,
    host: that.settings.dbhost,
    port: that.settings.dbport
  });
};

server.prototype.startSocketServer = function () {
  log.info("Starting socket.io server");
  that.app = require('express')();
  that.http = require('http').Server(that.app);
  that.io = require('socket.io')(that.http);

  that.io.on('connection', that.onClientConnection);

  that.http.listen(that.settings.socketport, function(){
    log.info('listening on *:3000');
  });
  that.clients = [];
};

server.prototype.onClientConnection = function (socket) {
  log.info("One user is connected");
  that.clients.push(socket);
  socket.on('sign_up', function(data) {
    require('./userConnection/signUp').signUp(data, socket, that.mongo);
  });
  socket.on('ping', function (data) {
    socket.emit('pong', null);
  });
};

module.exports = server;
