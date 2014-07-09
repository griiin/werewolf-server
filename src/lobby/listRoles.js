var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
roles = require('../roles/roles');

exports.listRoles = function (data, user, mongo) {
  if (!user.rolesLoaded) {
    user.socket.emit("list_roles_response", { result: true, roles: roles.getAllName() });

    user.rolesLoaded = true;
  } else {
    user.socket.emit("list_roles_response", { result: false });
  }
};
