var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

describe("Server's Sign Up system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer());
  });

  afterEach(serverHelper.clearAll);

  jh.it("should handle client sign up", function(callback) {
    spyOn(require('../../src/connection/signUp'), 'signUp').andCallThrough();

    client.connectAndSignUp(this.options.socketport)
    .then(_.bind(function (data) {
      expect(require('../../src/connection/signUp').signUp).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should create an user if informations are correct", function (callback) {
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };

    client.connectAndSignUp(this.options.socketport, signUpInfo)
    .then(_.bind(function (data) {
      expect(data.signUpResponseData.result).toBe(true);
      client.expectOneUserInDB(this.options)
      .then(function() {
        callback();
      });
    }, this))
    .done();
  }, this);

  jh.it("should handle bad username format", function (callback) {
    var signUpInfo = {
      username: '',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };

    client.connectAndSignUp(this.options.socketport, signUpInfo)
    .then(_.bind(function (data) {
      expect(data.signUpResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should handle bad password format", function (callback) {
    var signUpInfo = {
      username: 'username',
      password: '',
      email: 'username@email.com',
      gender: 'male'
    };

    client.connectAndSignUp(this.options.socketport, signUpInfo)
    .then(_.bind(function (data) {
      expect(data.signUpResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should handle bad email format", function (callback) {
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: '',
      gender: 'male'
    };

    client.connectAndSignUp(this.options.socketport, signUpInfo)
    .then(_.bind(function (data) {
      expect(data.signUpResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should handle bad gender format", function (callback) {
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'martian'
    };

    client.connectAndSignUp(this.options.socketport, signUpInfo)
    .then(_.bind(function (data) {
      expect(data.signUpResponseData.result).toBe(false);
      callback();
    }, this))
    .done();
  }, this);

  jh.it("should refuse account with same username", function (callback) {
    var signUpInfoInnocentUser = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };
    var signUpInfoEvilUser = {
      username: 'username',
      password: 'password2',
      email: 'username2@email.com',
      gender: 'female'
    };

    var data = {port : this.options.socketport, signUpInfo: signUpInfoInnocentUser};
    client.connectNewClient(data)
    .then(client.signUp)
    .then(client.disconnect)
    .then(client.connectNewClient)
    .then(function (data) {
      data.signUpInfo = signUpInfoEvilUser;
      client.signUp(data)
      .then(function (data) {
        expect(data.signUpResponseData.result).toBe(false);
        callback();
      })
      .done();
    })
    .done();
  }, this);
});
