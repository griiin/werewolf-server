var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();

var lobby = function () {

};

lobby.prototype.listRoles = function (data) {
  var deferred = Q.defer();

  data.client.on("list_roles_response", function (responseData) {
    data.listRolesResponseData = responseData;
    deferred.resolve(data);
  });
  data.client.emit("list_roles");

  return deferred.promise;
};

lobby.prototype.createGame = function (data) {
  var deferred = Q.defer();

  data.client.on("create_game_response", function (responseData) {
    data.createGameResponseData = responseData;
    deferred.resolve(data);
  });
  data.client.emit("create_game", data.createGameInfo);

  return deferred.promise;
};

lobby.prototype.joinGame = function (data) {
  var deferred = Q.defer();

  data.client.on("join_game_response", function (responseData) {
    data.joinGameResponseData = responseData;
    deferred.resolve(data);
  });
  data.client.emit("join_game", {id: data.createGameResponseData.id});

  return deferred.promise;
};

lobby.prototype.joinBadGame = function (data) {
  var deferred = Q.defer();

  data.client.on("join_game_response", function (responseData) {
    data.joinGameResponseData = responseData;
    deferred.resolve(data);
  });
  data.client.emit("join_game", {id: 'á'});

  return deferred.promise;
};

lobby.prototype.listGames = function (data) {
  var deferred = Q.defer();

  data.client.on("list_games_response", function (responseData) {
    data.listGamesResponseData = responseData;
    deferred.resolve(data);
  });
  data.client.emit("list_games");

  return deferred.promise;
};

module.exports = new lobby();
