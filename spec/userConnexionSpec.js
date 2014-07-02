describe("Running server", function() {

  beforeEach(function() {
    // init server
    var server = require('../lib/server.js');
    this.options = {
      dbname: 'werewolf-test-0001',
      dbhost: '127.0.0.1',
      dbport: 27017,
      socketport: 4245
    };

    spyOn(server.prototype, 'onClientConnexion').andCallThrough();

    this.server = new server(this.options);
    this.server.start();
  });

  afterEach(function() {
    this.server.stop();
  });

  it("should handle client connexion", function () {
    waits(50);
    runs(function () {
      expect(this.server.onClientConnexion).not.toHaveBeenCalled();
    });
    runs(function () {
      this.client = require('socket.io-client').connect('http://localhost:' + this.options.socketport);
    });
    waits(50);
    runs(function () {
      expect(this.server.onClientConnexion).toHaveBeenCalled();
    });
  });

});
