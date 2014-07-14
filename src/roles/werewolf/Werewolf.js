var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
AWerewolf = require('./AWerewolf');

var Werewolf = function () {

};

Werewolf.prototype.specialPower = function () {
  log.error("Bazinga!");
};

Werewolf.roleName = 'werewolf';

_.extend(Werewolf, AWerewolf);

module.exports = Werewolf;
