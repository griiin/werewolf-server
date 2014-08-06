var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

describe("Game's city hall vote system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should allow user vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("vote_response", function (response) {
        if (response.result) {
          flag = true;
        }
      });
      data.client.emit("vote", {target: 'username0'});
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

  jh.it("should refuse bad vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("vote_response", function (response) {
        if (!response.result) {
          flag = true;
        }
      });
      data.client.emit("vote", {target: 'UNKNOWN_username'});
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

  jh.it("should refuse self-vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("vote_response", function (response) {
        if (!response.result) {
          flag = true;
        }
      });
      data.client.emit("vote", {target: 'username4'});
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

  jh.it("should allow cancel vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("vote_response", function (response) {
        if (response.result) {
          flag = true;
        }
      });
      data.client.emit("cancel_vote");
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

  jh.it("should allow cancel vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("vote_response", function (response) {
        if (response.result) {
          flag = true;
        }
      });
      data.client.emit("cancel_vote");
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
