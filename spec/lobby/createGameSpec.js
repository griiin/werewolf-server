var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

xdescribe("Server's game creation system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should call createGame module when a client try to create a game", function(callback) {
    var data = {
      port : this.options.socketport
    };
    spyOn(require('../../src/lobby/createGame'), 'createGame').andCallThrough();

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(_.bind(function (data) {
      expect(require('../../src/lobby/createGame').createGame).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should handle game create from a client", function(callback) {
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

  jh.it("should refuse game creation if there is less than 6 roles", function(callback) {
    var data = {
      port : this.options.socketport,
      createGameInfo: {
        password: "xyz",
        language: "FR",
        roles: []
      }
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(_.bind(function (data) {
      expect(data.createGameResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse game creation if we tried to add an unknown role", function(callback) {
    var data = {
      port : this.options.socketport,
      createGameInfo: {
        password: "xyz",
        language: "FR",
        roles: [{roleName: 'peasant', nb: 5},
        {roleName: 'werewolf', nb: 1}]
      }
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.createGame)
    .then(_.bind(function (data) {
      expect(data.createGameResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);
});
