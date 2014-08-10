/*
it should launchNight
launch night
should allow werewolf sending a message
should allow werewolf receiving a message
should allow werewolf voting to kill someone
should denied werewolf voting after its duration
should denied non-werewolf to do werewolf actions
should denied citizen to talk
should stop game if night is conclusive
should launch night summary

*/
var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

describe("Game's night", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should launch night", function (callback) {
    var cb = function (data) {
      var flag = true;
      data.client.on("night_stop", function () {
        expect(flag).toBe(true);
        callback();
      });
    };
    var data = {
      port : this.options.socketport,
      cityHallCB: cb
    };
    game.prepareClassicGame(data)
    .then(game.goToFirstNightAndKillAllWerewolves)
    .then(game.launchClassicGame)
    .done();
  }, this);

  jh.xit("should refuse citizen to talk", function (callback) {
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
});
