var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.createGame = function (data, socket, mongo, games) {
  if (checkLanguage(data.language)) {
    socket.emit("create_game_response", { result: true });
  } else {
    socket.emit("create_game_response", { result: false });
  }
};

function checkLanguage(str) {
  // check iso-norme here : http://en.wikipedia.org/wiki/ISO_3166-1
  // here we'll use the Alpha-2 code
  var acceptedLanguage = [
  "FR",
  "EN"
  ];

  return _(acceptedLanguage).contains(str);
}
