var Q = require("Q");
var log = require('../misc/log.js')();

exports.signIn = function (data, socket, mongo, callback) {
  if (!verifyData(data)) {
    log.info('[usr] sign_in failed');
    respond(socket, "INCORRECT_DATA");
    return;
  }
  tryToFindUser(data, socket, mongo, callback);
};

function tryToFindUser(data, socket, mongo, callback) {
  var users = mongo.collection('users');
  users.find({username: data.username}, {limit: 1}, function (error, results) {
    message = "UNKNOWN_USER";
    if (results.length === 1) {
      message = "WRONG_PASSWORD";
      var user = results[0];
      if (user.password === data.password) {
        user.socket = socket;
        callback(user, respond);
        return;
      }
    }
    respond(socket, message);
  });
}

function respond(socket, error) {
  socket.emit("sign_in_response", {result: !error, message: error});
}

function checkField(field, max) {
  return typeof field == "string" &&
  field.length >= 6 &&
  field.length <= max;
}

function verifyData(data) {
  return !!data &&
  checkField(data.username, 42) &&
  checkField(data.password, 512);
}
