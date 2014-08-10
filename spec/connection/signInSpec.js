var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

xdescribe("Server's Sign in system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({debug: true}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should handle client sign in", function(callback) {
    spyOn(require('../../src/connection/signIn'), 'signIn').andCallThrough();

    client.connectNewClient({port : this.options.socketport})
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(require('../../src/connection/signIn').signIn).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should accept user login if there is a corresponding account", function(callback) {
    var done = false;

    client.connectNewClient({port: this.options.socketport})
    .then(client.signUp)
    .then(client.disconnect)
    .then(client.connectNewClient)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(true);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user login if he's already logged in", function(callback) {
    var done = false;

    client.connectNewClient({port: this.options.socketport})
    .then(client.signUp)
    .then(client.connectNewClient)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(false);
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

    client.connectNewClient(data)
    .then(client.signUp)
    .then(client.disconnect)
    .then(client.connectNewClient)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(false);
      expect(data.signInResponseData.message).toBe("UNKNOWN_USER");
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse user login if password is incorrect", function(callback) {
    var data = {
      port : this.options.socketport,
      signInInfo: {
        username: 'username',
        password: 'bad_password'
      }
    };

    client.connectNewClient(data)
    .then(client.signUp)
    .then(client.disconnect)
    .then(client.connectNewClient)
    .then(client.signIn)
    .then(_.bind(function (data) {
      expect(data.signInResponseData.result).toBe(false);
      expect(data.signInResponseData.message).toBe("WRONG_PASSWORD");
      callback();
    }, this))
    .done();
  }, this);
});
