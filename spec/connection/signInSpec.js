var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();
var client = require("../helper/client.js");

describe("Server's Sign in system", function() {

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

  it("should handle client sign in", function() {
    var done = false;
    spyOn(require('../../src/connection/signIn'), 'signIn').andCallThrough();

    runs(function() {
      log.debug(client.connectClient);
      client.connectClient({port : this.options.socketport})
      .then(client.signIn)
      .then(_.bind(function (data) {
        expect(require('../../src/connection/signIn').signIn).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should accept user login if there is a corresponding account", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      },
      signInInfo: {
        username: 'username',
        password: 'password'
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(client.signIn)
      .then(_.bind(function (data) {
        expect(data.signInResponseData.result).toBe(true);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should refuse user login if there is no corresponding account", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      },
      signInInfo: {
        username: 'username11',
        password: 'password'
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(client.signIn)
      .then(_.bind(function (data) {
        expect(data.signInResponseData.result).toBe(false);
        expect(data.signInResponseData.message).toBe("UNKNOWN_USER");
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should refuse user login if there is a corresponding account but with another password", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      },
      signInInfo: {
        username: 'username',
        password: 'password2'
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(client.signIn)
      .then(_.bind(function (data) {
        expect(data.signInResponseData.result).toBe(false);
        expect(data.signInResponseData.message).toBe("WRONG_PASSWORD");
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });
});
