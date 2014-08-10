var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

xdescribe("Game's Waiting room system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: false, verbose: false}));

    // kill all werewolf so the game will finish instantly
    var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
    Werewolf.prototype.isAlive = false;
  });

  afterEach(serverHelper.clearAll);

  jh.it("should send a broadcast when an user is connected", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['new_player']
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .delay(20)
    .then(_.bind(function (data) {
      var response = data.players[0].new_player;
      expect(response[0].playerNb).toBe(2);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should send a broadcast when an user is disconnected", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['player_left']
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.disconnect)
    .delay(20)
    .then(_.bind(function (data) {
      var response = data.players[0].player_left;
      expect(response[0].playerNb).toBe(1);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should launch the game when all users are here", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['game_start']
    };

    game.prepareClassicGame(data)
    .then(game.launchClassicGame)
    .then(_.bind(function (data) {
      var response = data.players[0].game_start;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should send player list when game is launched", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['game_start']
    };

    game.prepareClassicGame(data)
    .then(game.launchClassicGame)
    .delay(29)
    .then(_.bind(function (data) {
      var response = data.players[0].game_start;
      expect(response.length).not.toBe(0);
      expect(response[0].playerList.length).toBe(6);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user's connection if the game is full", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['game_start']
    };


    game.prepareClassicGame(data)
    .then(game.launchClassicGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(_.bind(function (data) {
      expect(data.joinGameResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should send users their roles", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['your_role']
    };

    game.prepareClassicGame(data)
    .then(game.launchClassicGame)
    .then(_.bind(function (data) {
      var response = data.players[0].your_role;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should stop when every one has left", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['your_role']
    };

    game.prepareClassicGame(data)
    .then(game.launchClassicGame)
    .then(lobby.allClientsLeaveGame)
    .then(lobby.listGames)
    .then(_.bind(function (data) {
      expect(data.listGamesResponseData.result).toBe(true);
      expect(data.listGamesResponseData.games.length).toBe(0);
      callback();
    }, this))
    .done();
  }, this);
});
