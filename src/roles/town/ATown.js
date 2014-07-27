var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ARole = require('../ARole');

var ATown = function () {

};

ATown.prototype.team = 'town';

_.extend(ATown.prototype, ARole.prototype);

module.exports = ATown;
