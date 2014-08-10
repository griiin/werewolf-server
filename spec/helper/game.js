var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

var game = function () {

};

game.prototype.prepareClassicGame = function (options) {
  var deferred = Q.defer();

  client.connectNewClient(options)
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
  .then(function(data) {
    deferred.resolve(data);
  })
  .done();

  return deferred.promise;
};

game.prototype.launchClassicGame = function (data) {
  var deferred = Q.defer();

  client.signUpNew(data)
  .then(lobby.joinGame)
  .then(function(nData) {
    deferred.resolve(nData);
  })
  .done();

  return deferred.promise;
};

game.prototype.goToFirstNightAndKillAllWerewolves = function (data) {
  var lastClient = data.client;
  var Game = require('../../src/game/Game.js');
  Game.delayFactor = 0.4;
  lastClient.on("night_start", function (response) {
    data.cityHallCB(data);
    // kill all werewolf so the game will finish instantly
    var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
    Werewolf.prototype.isAlive = false;
  });
  return data;
};

game.prototype.goToSecondCityHallAndKillAllWerewolves = function (data) {
  var lastClient = data.client;
  var Game = require('../../src/game/Game.js');
  Game.delayFactor = 0.4;
  var counter = 0;
  lastClient.on("cityhall_start", function (response) {
    counter++;
    if (counter === 2) {
      // kill all werewolf so the game will finish instantly
      var Werewolf = require('../../src/roles/werewolf/Werewolf.js');
      Werewolf.prototype.isAlive = false;
      data.cityHallCB(data);
    }
  });
  return data;
};

module.exports = new game();
