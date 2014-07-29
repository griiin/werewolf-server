var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Game's summary system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: false, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should send a endgame summary to all player at the end", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['end_game']
    };

    // all werewolf so the game will finish instantly
    var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
    Werewolf.prototype.isAlive = false;
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
    .then(lobby.allClientsLeaveGame)
    .delay(20)
    .then(_.bind(function (data) {
      var response = data.players[0].end_game;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);
});
