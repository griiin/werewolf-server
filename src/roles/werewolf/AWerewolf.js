var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ARole = require('../ARole');

var AWerewolf = function () {

};

AWerewolf.prototype.team = 'werewolf';

_.extend(AWerewolf.prototype, ARole.prototype);

module.exports = AWerewolf;
