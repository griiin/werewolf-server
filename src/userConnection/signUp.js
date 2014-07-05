var log = require('../misc/log.js')();

exports.signUp = function (data, socket, mongo) {
  if (!CheckData(data)) {
    log.info('[usr] sign_up failed');
    socket.emit("sign_up_response", { result: false, message: "INCORRECT_DATA" });
    return;
  }
  var users = mongo.collection('users');
  users.find({username: data.username}, function (error, results) {
    if (results.length > 0) {
      log.info('[usr] sign_up failed');
      socket.emit("sign_up_response", {result: false, message: "ERROR_DATABASE"});
      return;
    }
    users.save({
      username: data.username,
      password: data.password,
      email: data.email,
      gender: data.gender
    }, function (error, results) {
      if (!error) {
        log.info("[mdb] user saved");
        socket.emit("sign_up_response", { result: true });
      } else {
        log.info("[mdb] user save failed");
      }
    });
  });
};

function CheckField(field, max) {
  return typeof field == "string" && field.length >= 6 && field.length <= max;
}

function CheckData(data) {
  return !!data && CheckField(data.username, 42) && CheckField(data.password, 512) && CheckField(data.email, 42) && (data.gender === "male" || data.gender === "female");
}
