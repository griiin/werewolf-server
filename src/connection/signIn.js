var Q = require("Q");
var log = require('../misc/log.js')();

exports.signIn = function (data, socket, mongo, callback) {
  if (!VerifyData(data)) {
    log.info('[usr] sign_in failed');
    socket.emit("sign_in_response", {result: false, message: "INCORRECT_DATA"});
    return;
  }
  tryToFindUser(data, socket, mongo, callback)
  .then(function (result) {
    log.info('[usr] sign_in => ', result);
    socket.emit("sign_in_response", result);
  })
  .done();
};

function tryToFindUser(data, socket, mongo, callback) {
  var deferred = Q.defer();

  var users = mongo.collection('users');
  users.find({username: data.username}, {limit: 1}, function (error, results) {
    var message = "UNKNOWN_USER";
    var result = false;
    if (results.length == 1) {
      message = "WRONG_PASSWORD";
      var user = results[0];
      if (user.password == data.password) {
        message = "";
        result = true;
        callback({data: user, socket: socket});
      }
    }
    deferred.resolve({result: result, message: message});
  });

  return deferred.promise;
}

function CheckField(field, max) {
  return typeof field == "string" &&
  field.length >= 6 &&
  field.length <= max;
}

function VerifyData(data) {
  return !!data &&
  CheckField(data.username, 42) &&
  CheckField(data.password, 512);
}
