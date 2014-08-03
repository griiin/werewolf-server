var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
AWerewolf = require('./AWerewolf');

var Werewolf = function () {

};

Werewolf.prototype.specialPower = function () {
  log.error("Grrouuu!");
};

Werewolf.prototype.roleName = 'werewolf';

_.extend(Werewolf.prototype, AWerewolf.prototype);

module.exports = Werewolf;
