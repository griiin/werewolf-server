var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

describe("Game's city hall lynch system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should allow non-accused player to vote guilty", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("lynch_start", function (response) {
        data.client.on("vote_response", function (data) {
          flag = data.result;
        });
        data.client.emit("vote", {isGuilty: true});
      });
      data.client.emit("vote", {target: 'username'});
      data.client.on("cityhall_stop", function (response) {
        expect(flag).toBe(true);
        callback();
      });
    };
    var data = {
      port : this.options.socketport,
      cityHallCB: cb
    };
    game.prepareClassicGame(data)
    .then(game.goToSecondCityHallAndKillAllWerewolves)
    .then(game.launchClassicGame)
    .done();
  }, this);

  jh.it("should kill with extrem prejudice guilty player", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("tribunal_summary", function (data) {
        flag = data.isJugedGuilty;
      });
      data.client.on("lynch_start", function (response) {
        data.client.emit("vote", {isGuilty: true});
        data.clients[2].emit("vote", {isGuilty: true});
        data.clients[3].emit("vote", {isGuilty: false});
      });
      data.clients[1].emit("vote", {target: 'username'});
      data.client.on("cityhall_stop", function (response) {
        expect(flag).toBe(true);
        callback();
      });
    };
    var data = {
      port : this.options.socketport,
      cityHallCB: cb
    };
    game.prepareClassicGame(data)
    .then(game.goToSecondCityHallAndKillAllWerewolves)
    .then(game.launchClassicGame)
    .done();
  }, this);

  jh.it("should spare accused player in case of a draw", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("tribunal_summary", function (data) {
        flag = !data.isJugedGuilty;
      });
      data.client.on("lynch_start", function (response) {
        data.client.emit("vote", {isGuilty: true});
        data.clients[2].emit("vote", {isGuilty: true});
        data.clients[3].emit("vote", {isGuilty: false});
        data.clients[4].emit("vote", {isGuilty: false});
      });
      data.clients[1].emit("vote", {target: 'username'});
      data.client.on("cityhall_stop", function (response) {
        expect(flag).toBe(true);
        callback();
      });
    };
    var data = {
      port : this.options.socketport,
      cityHallCB: cb
    };
    game.prepareClassicGame(data)
    .then(game.goToSecondCityHallAndKillAllWerewolves)
    .then(game.launchClassicGame)
    .done();
  }, this);
});
