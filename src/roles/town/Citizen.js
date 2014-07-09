var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ATown = require('./ATown');

var Citizen = function () {

};

Citizen.prototype.name = 'citizen';

_.extend(Citizen.prototype, ATown.prototype);

module.exports = Citizen;
