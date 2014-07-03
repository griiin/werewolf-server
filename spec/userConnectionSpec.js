describe("Running server", function() {

  beforeEach(function() {
    // init server
    var server = require('../lib/server.js');
    this.options = {
      dbname: 'werewolf-test-0001',
      dbhost: '127.0.0.1',
      dbport: 27017,
      socketport: 4248
    };

    spyOn(server.prototype, 'onClientConnection').andCallThrough();

    this.server = new server(this.options);
    this.server.start();
  });

  afterEach(function() {
    this.server.stop();
  });

  it("should handle client Connection", function () {
    waits(50);
    runs(function () {
      expect(this.server.onClientConnection).not.toHaveBeenCalled();
    });
    runs(function () {
      var client = require('socket.io-client').connect('http://localhost:' + this.options.socketport, {
        'reconnection delay' : 0,
        'reopen delay' : 0,
        'force new connection' : true
      });
      client.on('connect', function() {
        client.disconnect();
      });
    });
    waits(50);
    runs(function () {
      expect(this.server.onClientConnection).toHaveBeenCalled();
    });
  });

  it("should handle user sign up", function () {
    runs(function () {
      spyOn(require('../lib/userConnection/signUp'), 'signUp').andCallThrough();
      var client = require('socket.io-client').connect('http://localhost:' + this.options.socketport, {
        'reconnection delay' : 0,
        'reopen delay' : 0,
        'force new connection' : true
      });
      client.on('connect', function() {
        client.emit('sign_up', null);
        client.on('sign_up_response', function (data) {
          client.disconnect();
        });
      });
    });
    waits(50);
    runs(function () {
      expect(require('../lib/userConnection/signUp').signUp).toHaveBeenCalled();
    });
  });
  it("should handle client Connection", function () {
    waits(50);
    runs(function () {
      expect(this.server.onClientConnection).not.toHaveBeenCalled();
    });
    runs(function () {
      var client = require('socket.io-client').connect('http://localhost:' + this.options.socketport, {
        'reconnection delay' : 0,
        'reopen delay' : 0,
        'force new connection' : true
      });
      client.on('connect', function() {
        client.disconnect();
      });
    });
    waits(50);
    runs(function () {
      expect(this.server.onClientConnection).toHaveBeenCalled();
    });
  });
});
