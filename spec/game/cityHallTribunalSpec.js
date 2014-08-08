/*
it should start tribunal if vote are conclusive
tribunal
it should allow accused player to send message
it should allow non-accused players to send message
it should allow non-accused players to received message
it should denied accused player receiving non-accused players messages
it should denied actions after its duration
*/
var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

describe("Game's city hall tribunal", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should launch tribunal if vote design someone", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("launch_tribunal", function (response) {
        flag = true;
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
