var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

xdescribe("Server's lobby system", function() {
  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({spyOn: 'onLobby'}));
  });

  afterEach(serverHelper.clearAll);

  jh.it("should handle client joining the lobby", function (callback) {
    client.connectClient({port: this.options.socketport})
    .then(client.signUp)
    .then(_.bind(function (data) {
      expect(this.server.onLobby).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);
});
