var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
roles = require('../roles/roles');

var Player = function (client) {
  this.client = client;
};

Player.prototype.emit = function () {
  this.client.socket.emit.apply(this.client.socket, arguments);
};

Player.prototype.getClient = function () {
  return this.client;
};

module.exports = Player;
