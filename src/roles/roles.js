var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
Citizen = require('./town/Citizen.js'),
Werewolf = require('./werewolf/Werewolf.js');

var roles = function () {

};

roles.prototype.getAll = function() {
  return [
    Citizen,
    Werewolf
  ];
  // Citizen       :
  // Hunter        : require('./town/Hunter'),
  // Werewolf      : require('./werewolf/Werewolf'),
  // AlphaWerewolf : require('./werewolf/AlphaWerewolf'),
  // Jester        : require('./neutral/Jester')
};

roles.prototype.getAllName = function () {
  return _.map(this.getAll(), function (role) {
    return role.prototype.roleName;
  });
};

roles.prototype.contains = function (name) {
  return typeof name === 'string' &&
  _.contains(this.getAllName(), name);
};

roles.prototype.factory = function (roleName) {
  var list = this.getAll();
  var instance = _.find(list, function (role) {
    return role.prototype.roleName === roleName;
  });
  return instance ? new instance() : null;
};

module.exports = new roles();
