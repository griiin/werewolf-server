var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

var ARole = function () {

};

ARole.prototype.isAlive = true;

ARole.prototype.getIsAlive = function () {
  return this.isAlive;
};

ARole.prototype.Die = function () {
  this.isAlive = false;
};

ARole.prototype.clearVote = function () {
  this.voteTarget = null;
};

module.exports = ARole;
