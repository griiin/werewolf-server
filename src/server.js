var _ = require('lodash');
var log;

var server = function(options) {
  var defaults = {
    verbose: false,
    debug: false,
    displayTime: true
  };
  this.settings = _.extend(defaults, options);
  this.clients = [];
  log = require('./misc/log.js')({
    displayTime: this.settings.displayTime,
    verbose: this.settings.verbose,
    debug: this.settings.debug
  });
};

server.prototype.displayTitle = function () {
  log.base(" _     _  _______  ______    _______  _     _  _______  ___      _______ ");
  log.base("| | _ | ||       ||    _ |  |       || | _ | ||       ||   |    |       |");
  log.base("| || || ||    ___||   | ||  |    ___|| || || ||   _   ||   |    |    ___|");
  log.base("|       ||   |___ |   |_||_ |   |___ |       ||  | |  ||   |    |   |___ ");
  log.base("|       ||    ___||    __  ||    ___||       ||  |_|  ||   |___ |    ___|");
  log.base("|   _   ||   |___ |   |  | ||   |___ |   _   ||       ||       ||   |    ");
  log.base("|__| |__||_______||___|  |_||_______||__| |__||_______||_______||___|    ");
  log.base(" _______  _______  ______    __   __  _______  ______                    ");
  log.base("|       ||       ||    _ |  |  | |  ||       ||    _ |                   ");
  log.base("|  _____||    ___||   | ||  |  |_|  ||    ___||   | ||                   ");
  log.base("| |_____ |   |___ |   |_||_ |       ||   |___ |   |_||_                  ");
  log.base("|_____  ||    ___||    __  ||       ||    ___||    __  |                 ");
  log.base(" _____| ||   |___ |   |  | | |     | |   |___ |   |  | |                 ");
  log.base("|_______||_______||___|  |_|  |___|  |_______||___|  |_|       ");
  log.base("");
};

server.prototype.start = function () {
  this.displayTitle();
  log.info("welcome");
  log.info("[svr] starting");
  this.initializeDb();
  this.startSocketServer();
};

server.prototype.stop = function () {
  log.info("[svr] stopping");
  _(this.clients).forEach(function(client) {
    client.disconnect();
  });
  this.http.close();
  log.info("[mdb] stopping");
  this.mongo.close();
};

server.prototype.initializeDb = function () {
  log.info("[mdb] initilizing");
  var easyMongo = require('easymongo');
  this.mongo = new easyMongo({
    dbname: this.settings.dbname,
    host: this.settings.dbhost,
    port: this.settings.dbport
  });
};

server.prototype.startSocketServer = function () {
  log.info("[sio] starting");
  this.app = require('express')();
  this.http = require('http').Server(this.app);
  this.io = require('socket.io')(this.http);

  this.io.on('connection', _.bind(this.onClientConnection, this));

  this.http.listen(this.settings.socketport, _.bind(function(){
    log.info('[sio] listening on port ' + this.settings.socketport);
  }, this));
  this.clients = [];
};

server.prototype.getClientInfo = function (socket) {
  var addr = socket.handshake.address;
  if (addr) {
    return addr.address + ":" + addr.port;
  } else {
    return "test client";
  }
};

server.prototype.onClientConnection = function (socket) {
  log.info("[usr] '" + this.getClientInfo(socket) + "' connected");
  this.clients.push(socket);
  socket.on('sign_up', _.bind(function(data) {
    log.input("[usr] '" + this.getClientInfo(socket) + "' sign_up", "\ndata:\n ", data);
    require('./userConnection/signUp').signUp(data, socket, this.mongo);
  }, this));
  socket.on('ping', function (data) {
    socket.emit('pong', null);
  });
};

module.exports = server;
