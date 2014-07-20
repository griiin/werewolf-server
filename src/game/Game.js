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

module.exports = Game;
