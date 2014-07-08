var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')();

exports.listRoles = function (data, user, mongo) {
  if (!user.rolesLoaded) {
    user.socket.emit("list_roles_response", { result: true });
    user.rolesLoaded = true;
  } else {
    user.socket.emit("list_roles_response", { result: false });
  }
};
