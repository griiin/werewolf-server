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

module.exports = new game();