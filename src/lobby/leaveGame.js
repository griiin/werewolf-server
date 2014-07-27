var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.leaveGame = function (data, user, mongo, games) {
  var foundGames = _.first(games, function (game) {
    return game.contains(user);
  });
  if (foundGames && foundGames.length > 0) {
    if (foundGames[0].tryRemoveUser(user)) {
      var game = foundGames[0];
      user.socket.emit("leave_game_response", {result: true});
      if (game.players.length === 0)
        _.remove(games, game);
      return;
    }
  }
  user.socket.emit("leave_game_response", {result: false});
};
