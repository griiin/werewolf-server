var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

describe("Server's Sign in system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should handle client sign in", function(callback) {
    spyOn(require('../../src/connection/signIn'), 'signIn').andCallThrough();

    log.debug(client.connectClient);
    client.connectClient({port : this.options.socketport})
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(require('../../src/connection/signIn').signIn).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should accept user login if there is a corresponding account", function(callback) {
    var done = false;

    client.connectClient({port: this.options.socketport})
    .then(client.signUp)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user login if there is no corresponding account", function(callback) {
    var data = {
      port : this.options.socketport,
      signInInfo: {
        username: 'bad_username',
        password: 'password'
      }
    };

    client.connectClient(data)
    .then(client.signUp)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(false);
      expect(data.signInResponseData.message).toBe("UNKNOWN_USER");
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user login if there is a corresponding account but with another password", function(callback) {
    var data = {
      port : this.options.socketport,
      signInInfo: {
        username: 'username',
        password: 'bad_password'
      }
    };

    client.connectClient(data)
    .then(client.signUp)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(false);
      expect(data.signInResponseData.message).toBe("WRONG_PASSWORD");
      callback();
    }, this))
    .done();
  }, this);
});
