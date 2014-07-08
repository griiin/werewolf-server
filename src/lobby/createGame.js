var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.createGame = function (data, user, mongo, games) {
  if (!VerifyData(data)) {
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

function VerifyData (data) {
  return !!data &&
  checkLanguage(data.language);
}
