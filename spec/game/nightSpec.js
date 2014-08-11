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

  jh.it("should refuse citizen to talk", function (callback) {
    var cb = function (data) {
      var flag = false;
      var citizens = _.where(data.clients, function (c) {
        return c.roleName === 'citizen';
      });
      citizens[0].on("msg", function () {
        flag = true;
      });
      citizens[0].on("msg", "hello");
      data.client.on("night_stop", function () {
        expect(flag).toBe(false);
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

  jh.it("should allow werewolf to talk", function (callback) {
    var cb = function (data) {
      var flag = false;
      var werewolves = _.where(data.clients, function (c) {
        return c.roleName === 'werewolf';
      });
      werewolves[0].on("msg", function () {
        flag = true;
      });
      werewolves[0].emit("msg", "hello");
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

  jh.it("should refuse citizen to get werewolves messages", function (callback) {
    var cb = function (data) {
      var flag = false;
      var werewolves = _.where(data.clients, function (c) {
        return c.roleName === 'werewolf';
      });
      var citizens = _.where(data.clients, function (c) {
        return c.roleName === 'citizen';
      });
      citizens[0].on("msg", function () {
        flag = true;
      });
      werewolves[0].emit("msg", "hello");
      data.client.on("night_stop", function () {
        expect(flag).toBe(false);
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

  jh.it("should allow werewolf to vote", function (callback) {
    var cb = function (data) {
      var flag = false;
      var werewolves = _.where(data.clients, function (c) {
        return c.roleName === 'werewolf';
      });
      var citizens = _.where(data.clients, function (c) {
        return c.roleName === 'citizen';
      });
      werewolves[0].on("vote_response", function (response) {
        flag = response.result;
      });
      werewolves[0].emit("vote", {target: citizens[0].signUpInfo.username});
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

  jh.it("should refuse werewolf to vote against themselves", function (callback) {
    var cb = function (data) {
      var flag = false;
      var werewolves = _.where(data.clients, function (c) {
        return c.roleName === 'werewolf';
      });
      werewolves[0].on("vote_response", function (response) {
        flag = true;
        expect(response.result).toBe(false);
      });
      werewolves[0].emit("vote", {target: werewolves[0].signUpInfo.username});
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

  jh.it("should kill werewolves' target", function (callback) {
    var cb = function (data) {
      var flag = false;
      var werewolves = _.where(data.clients, function (c) {
        return c.roleName === 'werewolf';
      });
      var citizens = _.where(data.clients, function (c) {
        return c.roleName === 'citizen';
      });
      var target = citizens[0].signUpInfo.username;
      werewolves[0].on("vote_response", function (response) {
        flag = response.result;
      });
      werewolves[0].emit("vote", {target: target});
      data.client.on("night_stop", function (summary) {
        expect(flag).toBe(true);
        expect(summary.killed.length).toBe(1);
        expect(summary.killed[0]).toBe(target);
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
});
