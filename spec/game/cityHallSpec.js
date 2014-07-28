/*
todo:
it should start a city hall at the begin
city hall [without vote]
it should allow user sending a message
it should allow user receiving a message
it should denied user vote
it should stop allowing conversation after its duration
*/
var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Game's summary system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should start a city hall at the begin", function (callback) {
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
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(client.connectNewClient)
    .then(client.signUpNew)
    .then(lobby.joinGame)
    .then(lobby.allClientsLeaveGame)
    .delay(20)
    .then(_.bind(function (data) {
      var response = data.players[0].cityhall_start;
      expect(response.length).not.toBe(0);
      callback();
    }, this))
    .done();
  }, this);
});
