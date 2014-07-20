var _ = require('lodash'),
Q = require("Q"),
log;

var Server = function(options) {
  var defaults = {
    verbose: false,
    debug: false,
    displayTime: true
  };
  this.settings = _.extend(defaults, options);
  this.clients = [];
  this.users = [];
  this.games = [];
  log = require('./misc/log.js')().setOptions({
    displayTime: this.settings.displayTime,
    verbose: this.settings.verbose,
    debug: this.settings.debug
  });
};

Server.prototype.displayTitle = function () {
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

Server.prototype.start = function () {
  this.displayTitle();
  log.info("welcome");
  log.info("[svr] starting");
  this.initializeDb();
  this.startSocketServer();
};

Server.prototype.stop = function () {
  log.info("[svr] stopping");
  // Macking copy due to cleanClient which will delete clients from the array
  var clients = this.clients.slice(0);
  _.forEach(clients, function(client) {
    client.disconnect();
  });
  this.http.close();
  log.info("[mdb] stopping");
  this.mongo.close();
  log.info("byebye");
};

Server.prototype.initializeDb = function () {
  log.info("[mdb] initilizing");
  var easyMongo = require('easymongo');
  this.mongo = new easyMongo({
    dbname: this.settings.dbname,
    host: this.settings.dbhost,
    port: this.settings.dbport
  });
};

Server.prototype.startSocketServer = function () {
  log.info("[sio] starting");
  this.app = require('express')();
  this.http = require('http').Server(this.app);
  this.io = require('socket.io')(this.http);

  this.io.on('connection', _.bind(this.onClientConnection, this));

  this.http.listen(this.settings.socketport, _.bind(function(){
    log.info('[sio] listening on port ' + this.settings.socketport);
  }, this));
  this.clients = [];
  this.users = [];
  this.games = [];
};

Server.prototype.getClientInfo = function (socket) {
  var addr = socket.handshake.address;
  if (addr) {
    return addr.address + ":" + addr.port;
  } else {
    return "test client";
  }
};

Server.prototype.onClientConnection = function (socket) {
  log.info("[usr] '" + this.getClientInfo(socket) + "' trying to connect");
  if (!_(this.clients).contains(socket)) {
    log.info("[usr] '" + this.getClientInfo(socket) + "' connected");
    this.clients.push(socket);
    this.onClientDisconnection(socket);
    this.on(socket, 'sign_up', require('./connection/signUp').signUp, _.bind(this.onUserIdentification, this));
    this.on(socket, 'sign_in', require('./connection/signIn').signIn, _.bind(this.onUserIdentification, this));
  } else {
    log.info("[usr] '" + this.getClientInfo(socket) + "' already connected");
  }
};

Server.prototype.onClientDisconnection = function (socket) {
  socket.on('disconnect', _.bind(function () {
    _.forEach(this.games, function (game) {
      _.remove(game.users, {socket: socket});
    });
    _.remove(this.games, function (game) {
      return game.users.length === 0;
    });
    _.remove(this.clients, socket);
    _.remove(this.users, {socket: socket});
  }, this));
};

Server.prototype.onUserIdentification = function(user, respond) {
  this.cleanConnectionListeners(user.socket);
  var message = this.checkIdentifiedUsers(user.username);
  respond(user.socket, message);
  if (!message) {
    log.info("[usr] '" + user.username + "' (" + this.getClientInfo(user.socket) + ") entering lobby");
    this.initLobby(user);
    this.initLobbyListeners(user);
  }
};

Server.prototype.initLobbyListeners = function (user) {
  this.on(user, 'list_roles', require('./lobby/listRoles').listRoles);
  this.on(user, 'create_game', require('./lobby/createGame').createGame, {games: this.games, callback: _.bind(this.onGame, this)});
  this.on(user, 'join_game', require('./lobby/joinGame').joinGame, {games: this.games, callback: _.bind(this.onGame, this)});
  this.on(user, 'leave_game', require('./lobby/leaveGame').leaveGame, this.games);
  this.on(user, 'list_games', require('./lobby/listGames').listGames, this.games);
};

Server.prototype.initLobby = function (user) {
  user.rolesLoaded = false;
  this.users.push(user);
};

Server.prototype.cleanConnectionListeners = function (socket) {
  socket.removeAllListeners('sign_up');
  socket.removeAllListeners('sign_in');
};

Server.prototype.checkIdentifiedUsers = function (username) {
  if (_.contains(this.getUsernameList(), username)) {
    return "ALREADY_CONNECTED";
  }
};

Server.prototype.getUsernameList = function () {
  return _.map(this.users, "username");
};

Server.prototype.onGame = function(user, game) {
  log.debug("user connected Oo");
};

Server.prototype.on = function (client, actionName, func, additionalData) {
  // if the client isn't identify yet, client == client's socket
  var socket = client.socket ? client.socket : client;

  socket.on(actionName, _.bind(function(data) {
    log.input("[usr] '" + this.getClientInfo(socket) + "' " + actionName, "\ndata:\n ", data);
    func(data, client, this.mongo, additionalData);
  }, this));
};

module.exports = Server;
