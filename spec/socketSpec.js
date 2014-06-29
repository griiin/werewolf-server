describe("socket.io", function () {
  it("should be able to communicate with socket.io-client", function () {
    var proof = "";
    var flag = "eqf4qF!$";
    runs(function () {
      var io = require('socket.io').listen(4241);
      io.on('connection', function (socket) {
        socket.on('hello', function (data) {
          proof = data;
        });
      });
      var client = require('socket.io-client').connect('http://localhost:4241');
      client.on('connect', function () {
        client.emit('hello', flag);
      });
    });
    waits(50);
    runs(function () {
      expect(proof).toBe(flag);
    });
  });
});
