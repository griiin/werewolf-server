var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Server's list roles system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should call listRoles module when a client ask for them", function(callback) {
    var data = {
      port : this.options.socketport,
      signUpInfo: client.getBasicSignUpInfo()
    };
    spyOn(require('../../src/lobby/listRoles'), 'listRoles').andCallThrough();

    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.listRoles)
    .then(_.bind(function (data) {
      expect(require('../../src/lobby/listRoles').listRoles).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should send the roles to a client when he ask for them", function(callback) {
    var data = {
      port : this.options.socketport,
      signUpInfo: client.getBasicSignUpInfo()
    };
    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.listRoles)
    .then(_.bind(function (data) {
      expect(data.listRolesResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse to send the roles a second time", function(callback) {
    var data = {
      port : this.options.socketport,
      signUpInfo: client.getBasicSignUpInfo()
    };
    client.connectNewClient(data)
    .then(client.signUp)
    .then(lobby.listRoles)
    .then(lobby.listRoles)
    .then(_.bind(function (data) {
      expect(data.listRolesResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);
});
