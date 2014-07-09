var _ = require('lodash'),
Q = require("Q"),
log = require('../../misc/log.js')(),
ARole = require('../ARole');

var ATown = function () {

};

ATown.team = 'town';

_.extend(ATown, ARole);

module.exports = ATown;
