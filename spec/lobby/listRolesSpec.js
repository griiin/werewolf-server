var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
client = require("../helper/client.js"),
lobby = require("../helper/lobby.js");

describe("Server's list roles system", function() {

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
      debug: true
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

  it("should call listRoles module when a client ask for them", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      }
    };
    spyOn(require('../../src/lobby/listRoles'), 'listRoles').andCallThrough();

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(lobby.listRoles)
      .then(_.bind(function (data) {
        expect(require('../../src/lobby/listRoles').listRoles).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should send the roles to the user", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(lobby.listRoles)
      .then(_.bind(function (data) {
        expect(data.listRolesResponseData.result).toBe(true);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should refuse to send the roles more than one time", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(lobby.listRoles)
      .then(lobby.listRoles)
      .then(_.bind(function (data) {
        expect(data.listRolesResponseData.result).toBe(false);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });
});
