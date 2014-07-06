var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();
var client = require("../helper/client.js");

describe("Server's Sign Up system", function() {

  beforeEach(function() {
    // init server
    var server = require('../../src/server.js');
    this.options = {
      dbname: 'werewolf-test-0002',
      dbhost: '127.0.0.1',
      dbport: 27017,
      socketport: 4248,
      displayTime: false,
      verbose: false,
      debug: false
    };

    this.server = new server(this.options);
    this.server.start();
  });

  afterEach(function() {
    var done = false;
    runs(function() {
      ////
      // stop server
      this.server.stop();
      // clear db
      var easyMongo = require('easymongo');
      this.mongo = new easyMongo({
        dbname: this.options.dbname,
        host: this.options.dbhost,
        port: this.options.dbport
      });
      // clear users collection
      var users = this.mongo.collection('users');
      users.remove(function(results, err) {
        done = true;
      });
      this.mongo.close();
      ////
    });
    waitsFor(function () {
      return done;
    });
  });

  it("should handle client sign up", function() {
    var done = false;
    spyOn(require('../../src/connection/signUp'), 'signUp').andCallThrough();

    runs(function() {
      client.connectAndSignUp(this.options.socketport)
      .then(_.bind(function (data) {
        expect(require('../../src/connection/signUp').signUp).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should create an user if informations are correct", function () {
    var done = false;
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };

    runs(function() {
      client.connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(data.signUpResponseData.result).toBe(true);
        client.expectOneUserInDB(this.options)
        .then(function() {
          done = true;
        });
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle bad username format", function () {
    var done = false;
    var signUpInfo = {
      username: '',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };

    runs(function() {
      client.connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(data.signUpResponseData.result).toBe(false);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle bad password format", function () {
    var done = false;
    var signUpInfo = {
      username: 'username',
      password: '',
      email: 'username@email.com',
      gender: 'male'
    };

    runs(function() {
      client.connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(data.signUpResponseData.result).toBe(false);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle bad email format", function () {
    var done = false;
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: '',
      gender: 'male'
    };

    runs(function() {
      client.connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(data.signUpResponseData.result).toBe(false);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle bad gender format", function () {
    var done = false;
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'martian'
    };

    runs(function() {
      client.connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(data.signUpResponseData.result).toBe(false);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should refuse account with same username", function () {
    var done = false;
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

    runs(function() {
      var data = {port : this.options.socketport, signUpInfo: signUpInfoInnocentUser};
      client.connectClient(data)
      .then(client.signUp)
      .then(function (data) {
        data.signUpInfo = signUpInfoEvilUser;
        client.signUp(data)
        .then(function (data) {
          expect(data.signUpResponseData.result).toBe(false);
          done = true;
        })
        .done();
      })
      .done();
    });
    waitsFor(function () { return done; });
  });
});
