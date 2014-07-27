var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
AWerewolf = require('./AWerewolf');

var Werewolf = function () {
  this.isAlive = false;
};

Werewolf.prototype.specialPower = function () {
  log.error("Grrouuu!");
};

Werewolf.roleName = 'werewolf';

_.extend(Werewolf.prototype, AWerewolf.prototype);

module.exports = Werewolf;
