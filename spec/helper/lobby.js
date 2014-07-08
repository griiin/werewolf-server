var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();

var lobby = function () {

};

lobby.prototype.createGame = function (data) {
  var deferred = Q.defer();

  data.client.on("create_game_response", function (createGameResponseData) {
    data.createGameResponseData = createGameResponseData;
    deferred.resolve(data);
  });
  data.client.emit("create_game", data.createGameInfo);

  return deferred.promise;
};

lobby.prototype.listRoles = function (data) {
  var deferred = Q.defer();

  data.client.on("list_roles_response", function (listRolesResponseData) {
    data.listRolesResponseData = listRolesResponseData;
    deferred.resolve(data);
  });
  data.client.emit("list_roles");

  return deferred.promise;
};

module.exports = new lobby();
