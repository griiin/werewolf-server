var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
sequence = require('../misc/mongoSequence.js'),
Game = require('../game/Game.js'),
roles = require('../roles/roles');

exports.createGame = function (data, user, mongo, additionalData) {
  if (!verifyData(data)) {
    user.socket.emit("create_game_response", { result: false });
    return;
  }
  var seq = new sequence(mongo, 'game_id');
  seq.next()
  .then(function(seq) {
    var game = new Game(seq.value, user);
    additionalData.games.push(game);
    user.socket.emit("create_game_response", { result: true, id: seq.value });
    additionalData.callback(user, game);
  })
  .done();
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
