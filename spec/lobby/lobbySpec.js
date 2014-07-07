var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();
var client = require("../helper/client.js");

describe("Server's lobby system", function() {

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

    spyOn(server.prototype, 'onLobby').andCallThrough();

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
      .then(_.bind(function (data) {
        expect(this.server.onLobby).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });
});
