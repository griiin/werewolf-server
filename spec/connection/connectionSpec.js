var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")(),
serverHelper = require("../helper/serverHelper.js")(),
jh = require("../helper/jasmineHelper.js")(),
client = require("../helper/client.js");

describe("Server's connection system", function() {

  beforeEach(function() {
    _.extend(this, serverHelper.getConfiguredServer({spyOn: 'onConnection'}));
  });

  afterEach(function () {
    this.server.stop();
  });

  jh.it("should handle client Connection", function(callback) {
    client.connectAndSignUp(this.options.socketport)
    .then(_.bind(function (data) {
      expect(this.server.onConnection).toHaveBeenCalled();
      callback();
    }, this))
    .done();
  }, this);
});
