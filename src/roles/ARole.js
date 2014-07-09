var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

var ARole = function () {

};

ARole.getRoles = function () {
  return [
    require('./town/Citizen').prototype.name
  ];
};

module.exports = ARole;
