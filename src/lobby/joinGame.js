var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.joinGame = function (data, user, mongo, additionalData) {
  if (!verifyData(data)) {
    user.socket.emit("join_game_response", { result: false });
    return;
  }
  if (!_.contains(additionalData.games, {id: data.id})) {
    user.socket.emit("join_game_response", { result: true });
    var game = _.first(additionalData.games, {id: data.id})[0];
    additionalData.callback(user, game);
  } else {
    user.socket.emit("join_game_response", { result: false });
  }
};

function verifyData (data) {
  return data &&
  data.id;
}
