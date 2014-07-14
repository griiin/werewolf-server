var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ARole = require('../ARole');

var AWerewolf = function () {

};

AWerewolf.team = 'werewolf';

_.extend(AWerewolf, ARole);

module.exports = AWerewolf;
