var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Server's leave game system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should handle an user leaving a game", function(callback) {
    var data = {
      port : this.options.socketport
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUp2)
    .then(lobby.joinGame)
    .then(lobby.leaveGame)
    .then(lobby.listGames)
    .then(_.bind(function (data) {
      expect(data.listGamesResponseData.result).toBe(true);
      expect(data.listGamesResponseData.games[0].userNb).toBe(1);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should delete a game where everybody left", function(callback) {
    var data = {
      port : this.options.socketport
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(lobby.leaveGame)
    .then(lobby.listGames)
    .then(_.bind(function (data) {
      expect(data.listGamesResponseData.result).toBe(true);
      expect(data.listGamesResponseData.games.length).toBe(0);
      callback();
    }, this))
    .done();
  }, this);
});
