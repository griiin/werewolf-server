/*
it should allow cancel vote
it should denied vote against himself
it should allow skip vote
it should denied actions after its duration
it should start another night if vote are unconclusive
*/

var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js"),
game = require("../helper/game.js");

describe("Game's city hall", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true, verbose: false}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should launch a city hall with vote enabled if nothing has happened at the last night", function (callback) {
    game.prepareClassicGame({port : this.options.socketport})
    .then(function (data) {
      var lastClient = data.client;
      var Game = require('../../src/game/Game.js');
      Game.delayFactor = 0.1;
      var counter = 0;
      lastClient.on("cityhall_start", function (response) {
        counter++;
        if (counter === 2) {
          // kill all werewolf so the game will finish instantly
          var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
          Werewolf.prototype.isAlive = false;
          expect(response.isVoteDisabled).toBe(false);
          callback();
        }
      });
      return data;
    })
    .then(game.launchClassicGame)
    .done();
  }, this);

  jh.it("should allow user sending and receiving message", function (callback) {
    var cb = function (data) {
      var flag = false;
      data.client.on("msg", function (response) {
        if (response) {
          flag = true;
        }
      });
      data.client.emit("msg", "hello");
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

  // should refuse bad vote
  // should accept skip vote
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

  //
  // jh.it("should denied user vote", function (callback) {
  //   game.prepareClassicGame({port : this.options.socketport})
  //   .then(_.bind(function (data) {
  //     var lastClient = data.client;
  //     var Game = require('../../src/game/Game.js');
  //     Game.delayFactor = 0.1;
  //     var flag = false;
  //     lastClient.on("cityhall_start", function (response) {
  //       expect(response.isVoteEnabled).toBe(false);
  //       lastClient.on("vote_response", function (response) {
  //         if (response) {
  //           flag = true;
  //         }
  //       });
  //       lastClient.emit("vote");
  //       lastClient.on("cityhall_stop", function (response) {
  //         expect(flag).toBe(false);
  //         callback();
  //       });
  //     });
  //     return data;
  //   }, this))
  //   .then(game.launchClassicGame)
  //   .done();
  // }, this);
  //
  // jh.it("should denied conversation after its duration", function (callback) {
  //   game.prepareClassicGame({port : this.options.socketport})
  //   .then(_.bind(function (data) {
  //     var lastClient = data.client;
  //     var Game = require('../../src/game/Game.js');
  //     Game.delayFactor = 0.1;
  //     var flag = false;
  //     lastClient.on("cityhall_stop", function (response) {
  //       lastClient.on("msg", function (response) {
  //         if (response) {
  //           flag = true;
  //         }
  //       });
  //       lastClient.emit("msg", "hello");
  //       lastClient.on("end_game", function (response) {
  //         expect(flag).toBe(false);
  //         callback();
  //       });
  //     });
  //     return data;
  //   }, this))
  //   .then(game.launchClassicGame)
  //   .done();
  // }, this);
});
