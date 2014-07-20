var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Server's list game system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: false, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should transmit game list if asked", function(callback) {
    var data = {
      port : this.options.socketport,
      createGameInfo: {
        password: "xyz",
        language: "FR",
        roles: [{roleName: 'citizen', nb: 5},
        {roleName: 'werewolf', nb: 1}]
      }
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(lobby.listGames)
    .then(_.bind(function (data) {
      expect(data.listGamesResponseData.result).toBe(true);
      expect(data.listGamesResponseData.games.length).toBe(1);
      // expect(data.listGameResponseData.games[0]).toBe(1);
      callback();
    }, this))
    .done();
  }, this);
});
