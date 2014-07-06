var Q = require("Q");
var _ = require("lodash");
var log = require("../src/misc/log.js")();

describe("Server's Sign in system", function() {

  beforeEach(function() {
    // init server
    var server = require('../src/server.js');
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

  function connectClient(data) {
    var deferred = Q.defer();
    data.client = require('socket.io-client').connect('http://localhost:' + data.port, {
      'reconnection delay' : 0,
      'reopen delay' : 0,
      'force new connection' : true
    });

    data.client.on('connect', function() {
      deferred.resolve(data);
    });
    return deferred.promise;
  }

  function signUp(data) {
    var deferred = Q.defer();

    data.client.on('sign_up_response', function (signUpResponseData) {
      data.signUpResponseData = signUpResponseData;
      deferred.resolve(data);
    });
    data.client.emit('sign_up', data.signUpInfo);

    return deferred.promise;
  }

  function signIn(data) {
    var deferred = Q.defer();

    data.client.on('sign_in_response', function (signInResponseData) {
      data.signInResponseData = signInResponseData;
      deferred.resolve(data);
    });
    data.client.emit('sign_in', data.signInInfo);

    return deferred.promise;
  }

  it("should handle client sign in", function() {
    var done = false;
    spyOn(require('../src/connection/signIn'), 'signIn').andCallThrough();

    runs(function() {
      connectClient({port : this.options.socketport})
      .then(signIn)
      .then(_.bind(function (data) {
        expect(require('../src/connection/signIn').signIn).toHaveBeenCalled();
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
      }};

      runs(function() {
        connectClient(data)
        .then(signUp)
        .then(signIn)
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
        }};

        runs(function() {
          connectClient(data)
          .then(signUp)
          .then(signIn)
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
          }};

          runs(function() {
            connectClient(data)
            .then(signUp)
            .then(signIn)
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
