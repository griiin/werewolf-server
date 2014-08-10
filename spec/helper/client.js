var Q = require("Q");
var _ = require("lodash");
var log = require("../../src/misc/log.js")();

var client = function () {

};

client.prototype.connectNewClient = function (data) {
  var deferred = Q.defer();

  data.client = require('socket.io-client').connect('http://localhost:' + data.port, {
    'reconnection delay' : 0,
    'reopen delay' : 0,
    'force new connection' : true
  });

  // save clients
  if (!data.clients) {
    data.clients = [];
  }
  var c = data.client;
  c.on("your_role", function (response) {
      c.roleName = response.roleName;
  });
  data.clients.push(c);

  data.client.on('connect', function() {
    deferred.resolve(data);
  });

  // listeners
  if (data.listeners) {
    if (!data.players) {
      data.players = [];
    }
    var receivedData = {};
    _.forEach(data.listeners, function (listener) {
      receivedData[listener] = [];
      data.client.on(listener, function (response) {
        receivedData[listener].push(response);
      });
    });
    data.players.push(receivedData);
  }
  return deferred.promise;
};

client.prototype.disconnect = function (data) {
  data.client.disconnect();
  return data;
};

client.prototype.signUp = _.bind(function (data) {
  var deferred = Q.defer();

  if (!data.signUpInfo) {
    data.signUpInfo = this.getBasicSignUpInfo();
  }
  data.client.on('sign_up_response', function (signUpResponseData) {
    data.signUpResponseData = signUpResponseData;
    deferred.resolve(data);
  });
  data.client.signUpInfo = _.clone(data.signUpInfo);
  data.client.emit('sign_up', data.signUpInfo);

  return deferred.promise;
}, client.prototype);

client.prototype.signUpNew = _.bind(function (data) {
  var pattern = /(.*)([0-9]+)/;
  if (pattern.test(data.signUpInfo.username))  {
    var tab = pattern.exec(data.signUpInfo.username);
    var username = tab[1];
    var nb = parseInt(tab[2]);
    nb++;
    data.signUpInfo.username = username + nb;
  } else {
    data.signUpInfo.username += '0';
  }
  return this.signUp(data);
}, client.prototype);

client.prototype.signIn = _.bind(function (data) {
  var deferred = Q.defer();

  if (!data.signInInfo) {
    data.signInInfo = this.getBasicSignInInfo();
  }
  data.client.on('sign_in_response', function (signInResponseData) {
    data.signInResponseData = signInResponseData;
    deferred.resolve(data);
  });
  data.client.emit('sign_in', data.signInInfo);

  return deferred.promise;
}, client.prototype);

client.prototype.close = function(data) {
  data.client.close();
  data.deferred.resolve(data);
};

client.prototype.connectAndSignUp = function(port, signUpInfo) {
  var deferred = Q.defer();

  var data = {port : port, signUpInfo: signUpInfo, deferred: deferred};
  this.connectNewClient(data)
  .then(this.signUp)
  .then(this.close)
  .done();

  return deferred.promise;
};

client.prototype.getDBInstance = function(options) {
  var easyMongo = require('easymongo');
  var db = new easyMongo({
    dbname: options.dbname,
    host: options.dbhost,
    port: options.dbport
  });
  return db;
};

client.prototype.expectOneUserInDB = function(options) {
  var deferred = Q.defer();

  var db = this.getDBInstance(options);
  var users = db.collection('users');
  users.find({}, function(err, data) {
    expect(data.length).toBe(1);
    deferred.resolve();
  });
  db.close();

  return deferred.promise;
};

client.prototype.getBasicSignUpInfo = function () {
  return {
    username: 'username',
    password: 'password',
    email: 'username@email.com',
    gender: 'male'
  };
};

client.prototype.getBasicSignInInfo = function () {
  return {
    username: 'username',
    password: 'password'
  };
};

module.exports = new client();
