/*
it should send a broadcast when an user is connected
it should launch the game when all users are here
it should refuse user's connection if the game is full
it should send the role to the user
it should stop when every one has left
*/
var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Game's Waiting room system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true}));
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
    .then(_.bind(function (data) {
      var response = data.players[0].new_player;
      expect(response[0].playerNb).toBe(2);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should launch the game when all users are here", function (callback) {
    var data = {
      port : this.options.socketport,
      listeners: ['game_start']
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
    .then(_.bind(function (data) {
      log.debug(data.players);
      var response = data.players[0].game_start;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);
});
