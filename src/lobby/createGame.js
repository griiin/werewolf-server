var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
roles = require('../roles/roles');

exports.createGame = function (data, user, mongo, games) {
  if (!verifyData(data)) {
    user.socket.emit("create_game_response", { result: false });
    return;
  }
  user.socket.emit("create_game_response", { result: true });
};

function checkLanguage (str) {
  // should verify the iso-norme ISO_3166 (http://en.wikipedia.org/wiki/ISO_3166-1)
  // here we'll use the Alpha-2 code
  var acceptedLanguage = [
  "FR",
  "EN"
  ];

  return _(acceptedLanguage).contains(str);
}

function checkRoles (roleList) {
  if (typeof roleList !== 'object') {
    return false;
  }
  var nbList = _.map(roleList, 'nb');
  var roleNb = _.reduce(nbList, function(sum, nb) {
    return sum + nb;
  });
  if (typeof roleNb !== 'number' || roleNb < 6 || roleNb > 20) {
    return false;
  }
  return _.every(roleList, function (role) {
    if (!role || !roles.contains(role.roleName)){
      return false;
    }
    return true;
  });
}

function verifyData (data) {
  return !!data &&
  checkRoles(data.roles) &&
  checkLanguage(data.language);
}
