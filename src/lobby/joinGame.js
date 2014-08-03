var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.joinGame = function (data, user, mongo, additionalData) {
  if (!verifyData(data)) {
    log.info("[jng] user " + user.username + " failed joining, data are corrupted");
    user.socket.emit("join_game_response", { result: false });
    return;
  }
  var search = _.first(additionalData.games, {id: data.id});
  if (search.length === 1) {
    log.info("[jng] user " + user.username + " joined game nb" + data.id);
    var game = search[0];
    if (game.tryAddUser(user)) {
      user.socket.emit("join_game_response", { result: true });
      additionalData.callback(user, game);
    } else {
      user.socket.emit("join_game_response", { result: false });
    }
  } else {
    log.info("[jng] user " + user.username + " failed joining");
    user.socket.emit("join_game_response", { result: false });
  }
};

function verifyData (data) {
  return data &&
  data.id;
}
