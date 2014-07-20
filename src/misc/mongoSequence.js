var _ = require('lodash'),
Q = require("Q"),
log = require('./log.js')();

var mongoSequence = function(mongo, sequenceName, max) {
  this.max = !!max ? max : 100000;
  this.sequenceName = sequenceName;
  this.sequences = mongo.collection('sequences');
};

mongoSequence.prototype.next = function() {
  var deferred = Q.defer();
  this.getSequence()
  .then(this.incrSequence)
  .then(_.bind(this.saveSequence, this))
  .then(function (seq) {
    deferred.resolve(seq);
  })
  .done();
  return deferred.promise;
};

mongoSequence.prototype.getSequence = function () {
  var deferred = Q.defer();

  this.sequences.find({name: this.sequenceName}, {limit: 0}, _.bind(function (error, results) {
    // results will contain searched sequence
    var seq = {name: this.sequenceName, value: 0, max: this.max};
    if (results.length == 1) {
      seq = results[0];
    }
    deferred.resolve(seq);
  }, this));

  return deferred.promise;
};

mongoSequence.prototype.incrSequence = function (seq) {
  seq.value++;
  seq.value %= seq.max;

  return seq;
};

mongoSequence.prototype.saveSequence = function (seq) {
  var deferred = Q.defer();

  this.sequences.save(seq, function (error, results) {
    deferred.resolve(seq);
  });

  return deferred.promise;
};

module.exports = mongoSequence;
