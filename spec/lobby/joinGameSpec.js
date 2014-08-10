var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

xdescribe("Server's joining game system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should make an user join the game he just created", function(callback) {
    var data = {
      port : this.options.socketport
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

  jh.it("should accept user joining a game", function(callback) {
    var data = {
      port : this.options.socketport
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(_.bind(function (data) {
      expect(data.joinGameResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user joining a game who doesn't exist", function(callback) {
    var data = {
      port : this.options.socketport
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinBadGame)
    .then(_.bind(function (data) {
      expect(data.joinGameResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);
});
