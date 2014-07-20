var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.listGames = function (data, user, mongo, games) {
  log.info("[lsg] transmitting game list to " + user.username);
  games = _.map(games, function (game) {
    return game.getInfo();
  });
  user.socket.emit('list_games_response', {result: true, games: games});
};
