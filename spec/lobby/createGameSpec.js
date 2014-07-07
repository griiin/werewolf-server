var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();
var client = require("../helper/client.js");
var lobby = require("../helper/lobby.js");

describe("Server's game creation system", function() {

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

  it("should call createGame module when a client try to create a game", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      },
      createGameInfo: {
        password: "xyz",
        language: "FR",
        classes: []
      }
    };
    spyOn(require('../../src/lobby/createGame'), 'createGame').andCallThrough();

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(lobby.createGame)
      .then(_.bind(function (data) {
        expect(require('../../src/lobby/createGame').createGame).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle game create from a client", function() {
    var done = false;
    var data = {
      port : this.options.socketport,
      signUpInfo: {
        username: 'username',
        password: 'password',
        email: 'username@email.com',
        gender: 'male'
      },
      createGameInfo: {
        password: "xyz",
        language: "FR",
        classes: []
      }
    };

    runs(function() {
      client.connectClient(data)
      .then(client.signUp)
      .then(lobby.createGame)
      .then(_.bind(function (data) {
        expect(data.createGameResponseData.result).toBe(true);
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });
});
