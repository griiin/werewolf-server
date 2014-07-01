describe("Running server", function() {
  beforeEach(function () {
    // init server
    var server = require('../src/server.js');
    var options = {
      dbname: 'werewolf-test-0001',
      dbhost: '127.0.0.1',
      dbport: 27017,
      socketport: 4240
    };

    spyOn(server.prototype, 'onClientConnexion').andCallThrough();

    this.server = new server(options);
    this.server.run();

    // init client
    this.client = require('socket.io-client').connect('http://localhost:' + options.socketport);
  });

  it("should handle new client connexion", function () {
    waits(50);
    runs(function () {
      expect(this.server.onClientConnexion).toHaveBeenCalled();
    });
  });
});
