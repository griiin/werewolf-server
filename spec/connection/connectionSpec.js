var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

xdescribe("Server's connection system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({spyOn: 'onClientConnection'}));
  });

  afterEach(function () {
    this.server.stop();
  });

  jh.it("should handle client Connection", function(callback) {
    client.connectAndSignUp(this.options.socketport)
    .then(_.bind(function (data) {
      expect(this.server.onClientConnection).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);
});
