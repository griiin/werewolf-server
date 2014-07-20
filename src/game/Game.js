var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
roles = require('../roles/roles');

var Game = function (id, creator) {
  this.id = id;
  this.users = [];
  this.users.push(creator);
};

Game.prototype.getInfo = function () {
  return {id : this.id, userNb : this.users.length};
};

Game.prototype.tryAddUser = function (user) {
  this.users.push(user);

  return true;
};

Game.prototype.tryRemoveUser = function (userToRemove) {
  if (this.contains(userToRemove)) {
    _.remove(this.users, function (user) {
      return user == userToRemove;
    });
    return true;
  }
  return false;
};

Game.prototype.contains = function (user) {
  return _.contains(this.users, user);
};

module.exports = Game;
