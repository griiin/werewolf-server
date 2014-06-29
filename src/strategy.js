var log = require("./log.js");
// console.log(nlog);

var strategy = function () {

};

strategy.prototype.run = function () {
  log.info("hey!");
  log.info("test", ["a", "b"]);
  log.warning("jcrois que ça va pas aller");
  log.error("Oula ça va pas là!!!");
  log.debug("machin a débugger", this);
  log.input("asdf asdfaesasf");
};

module.exports = new strategy();
