var Q = require("Q");
var _ = require("lodash");
var log = require("../src/misc/log.js")({ displayTime: false, verbose: false, debug: false });

describe("Server's Sign Up system", function() {

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

    spyOn(server.prototype, 'onClientConnection').andCallThrough();

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

  function close(data) {
    data.client.close();
    data.deferred.resolve(data);
  }

  function connectAndSignUp(port, signUpInfo) {
    var deferred = Q.defer();

    var data = {port : port, signUpInfo: signUpInfo, deferred: deferred};
    connectClient(data)
    .then(signUp)
    .then(close)
    .done();

    return deferred.promise;
  }

  function getDBInstance(options) {
    var easyMongo = require('easymongo');
    var db = new easyMongo({
      dbname: options.dbname,
      host: options.dbhost,
      port: options.dbport
    });
    return db;
  }

  function expectOneUserInDB(options) {
    var deferred = Q.defer();

    var db = getDBInstance(options);
    var users = db.collection('users');
    users.find({}, function(err, data) {
      expect(data.length).toBe(1);
      deferred.resolve();
    });
    db.close();

    return deferred.promise;
  }

  it("should handle client Connection", function() {
    var done = false;
    spyOn(require('../src/userConnection/signUp'), 'signUp').andCallThrough();

    runs(function() {
      connectAndSignUp(this.options.socketport)
      .then(_.bind(function (data) {
        expect(this.server.onClientConnection).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should handle client sign up", function() {
    var done = false;
    spyOn(require('../src/userConnection/signUp'), 'signUp').andCallThrough();

    runs(function() {
      connectAndSignUp(this.options.socketport)
      .then(_.bind(function (data) {
        expect(this.server.onClientConnection).toHaveBeenCalled();
        done = true;
      }, this))
      .done();
    });
    waitsFor(function () { return done; });
  });

  it("should create an user if informations are correct", function () {
    var done = false;
    spyOn(require('../src/userConnection/signUp'), 'signUp').andCallThrough();
    var signUpInfo = {
      username: 'username',
      password: 'password',
      email: 'username@email.com',
      gender: 'male'
    };

    runs(function() {
      connectAndSignUp(this.options.socketport, signUpInfo)
      .then(_.bind(function (data) {
        expect(require('../src/userConnection/signUp').signUp).toHaveBeenCalled();
        expect(data.signUpResponseData.result).toBe(true);
        expectOneUserInDB(this.options)
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
      connectAndSignUp(this.options.socketport, signUpInfo)
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
      connectAndSignUp(this.options.socketport, signUpInfo)
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
      connectAndSignUp(this.options.socketport, signUpInfo)
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
      connectAndSignUp(this.options.socketport, signUpInfo)
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
      connectClient(data)
      .then(signUp)
      .then(function (data) {
        data.signUpInfo = signUpInfoEvilUser;
        signUp(data)
        .then(function (data) {
          expect(data.signUpResponseData.result).toBe(false);
          done = true;
        });
      })
      .done();
    });
    waitsFor(function () { return done; });
  });
});
