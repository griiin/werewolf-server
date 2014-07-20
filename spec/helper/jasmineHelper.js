var Q = require("Q"),
_ = require("lodash"),
log = require("../../src/misc/log.js")();

var jasmineHelper = function () {
  this.testNb = 0;
};

jasmineHelper.prototype.wrapper = function(testCallback, that) {
  return _.bind(function () {
    var done = false;

    runs(_.bind(function() {
      var context = that.specs_[this.testNb++];
      testCallback.call(context, function () {
        done = true;
      });
    }, this));
    waitsFor(function () {
      return done;
    });
  }, this);
};

jasmineHelper.prototype.it = function (testName, testCallback, that) {
  if (!that) {
    log.error("thisArg must be defined");
  }
  it(testName, this.wrapper(testCallback, that));
};

jasmineHelper.prototype.xit = function (testName, testCallback, that) {

};

module.exports = function () {
  return new jasmineHelper();
};
