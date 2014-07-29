var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Game's city hall", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));

    // all werewolf so the game will finish instantly
    var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
    Werewolf.prototype.isAlive = false;
  });

  afterEach(serverHelper.clearAll);

  jh.it("should start a city hall at the beginning", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['cityhall_start']
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .delay(20)
    .then(_.bind(function (data) {
      var response = data.players[0].cityhall_start;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should allow user sending and receiving message", function (callback) {
    client.connectNewClient({port : this.options.socketport})
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(_.bind(function (data) {
      var lastClient = data.client;
      var Game = require('../../src/game/Game.js');
      Game.delayFactor = 2;
      var flag = false;
      lastClient.on("cityhall_start", function (response) {
        lastClient.on("msg", function (response) {
          if (response) {
            flag = true;
          }
        });
        lastClient.emit("msg", "hello");
        lastClient.on("cityhall_stop", function (response) {
          expect(flag).toBe(true);
          callback();
        });
      });
      return data;
    }, this))
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .done();
  }, this);

  jh.xit("should denied user vote", function (callback) {
    client.connectNewClient({port : this.options.socketport})
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(_.bind(function (data) {
      var lastClient = data.client;
      var Game = require('../../src/game/Game.js');
      Game.delayFactor = 2;
      var flag = false;
      lastClient.on("cityhall_start", function (response) {
        expect(response.isVoteEnabled).toBe(false);
        lastClient.on("vote_response", function (response) {
          if (response) {
            flag = true;
          }
        });
        lastClient.emit("vote");
        lastClient.on("cityhall_stop", function (response) {
          expect(flag).toBe(false);
          callback();
        });
      });
      return data;
    }, this))
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .done();
  }, this);

  jh.xit("should denied conversation after its duration", function (callback) {
    client.connectNewClient({port : this.options.socketport})
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(_.bind(function (data) {
      var lastClient = data.client;
      var Game = require('../../src/game/Game.js');
      Game.delayFactor = 2;
      var flag = false;
      lastClient.on("cityhall_stop", function (response) {
        lastClient.on("msg", function (response) {
          if (response) {
            flag = true;
          }
        });
        lastClient.emit("msg", "hello");
        lastClient.on("end_game", function (response) {
          expect(flag).toBe(false);
          callback();
        });
      });
      return data;
    }, this))
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .done();
  }, this);

});
