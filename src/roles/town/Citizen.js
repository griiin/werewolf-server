var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ATown = require('./ATown');

var Citizen = function () {

};

Citizen.prototype.specialPower = function () {
  log.error("Bazinga!");
};

Citizen.roleName = 'citizen';

_.extend(Citizen, ATown);

module.exports = Citizen;
