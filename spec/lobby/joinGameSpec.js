var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Server's joining game system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should make an user join the game he just created", function(callback) {
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
    .then(_.bind(function (data) {
      expect(data.createGameResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);

  jh.xit("should accept user joining a game", function(callback) {
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
    .then(client.connectNewClient)
    .then(client.signIn)
    .then(lobby.joinGame)
    .then(_.bind(function (data) {
      expect(data.joinGameResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);
});
