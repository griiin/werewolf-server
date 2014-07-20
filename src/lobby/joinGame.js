var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.joinGame = function (data, user, mongo, additionalData) {
  if (!verifyData(data)) {
    log.info("[jng] user " + user.username + " failed joining");
    user.socket.emit("join_game_response", { result: false });
    return;
  }
  var search = _.first(additionalData.games, {id: data.id});
  if (search.length === 1) {
    log.info("[jng] user " + user.username + " joined game nb" + data.id);
    user.socket.emit("join_game_response", { result: true });
    var game = search[0];
    additionalData.callback(user, game);
  } else {
    log.info("[jng] user " + user.username + " failed joining");
    user.socket.emit("join_game_response", { result: false });
  }
};

function verifyData (data) {
  return data &&
  data.id;
}
