var log = require('../misc/log.js')();

exports.signUp = function (data, socket, mongo, callback) {
  if (!verifyData(data)) {
    log.info('[usr] sign_up failed');
    respond(socket, "INCORRECT_DATA");
    return;
  }
  var users = mongo.collection('users');
  users.find({username: data.username}, function (error, results) {
    if (results.length > 0) {
      log.info('[usr] sign_up failed');
      respond(socket, "ERROR_DATABASE");
      return;
    }
    users.save({
      username: data.username,
      password: data.password,
      email: data.email,
      gender: data.gender
    }, function (error) {
      if (!error) {
        log.info("[mdb] user saved");
        data.socket = socket;
        callback(data, respond);
        return;
      } else {
        log.info("[mdb] user save failed");
        respond(socket, "ERROR_DATABASE");
      }
    });
  });
};

function respond(socket, message) {
  socket.emit("sign_up_response", {result: !message, message: message});
}

function checkField(field, max) {
  return typeof field == "string" &&
  field.length >= 6 &&
  field.length <= max;
}

function verifyData(data) {
  return !!data &&
  checkField(data.username, 42) &&
  checkField(data.password, 512) &&
  checkField(data.email, 42) &&
  (data.gender === "male" || data.gender === "female");
}
