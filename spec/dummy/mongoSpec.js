describe("easymongo", function () {
  var easyMongo = require('easymongo');
  var options = {
    dbname: 'werewolf-test-0001',
    host: '127.0.0.1',
    port: 27017
  };
  var mongo = new easyMongo(options);
  var users = mongo.collection('users');
  users.remove({name: 'test'}, function () {
  });

  it("should accept one entry.", function () {
    var proof = false;
    runs(function() {
      users.save({name: 'test'}, function (error) {
        if (!error) {
          proof = true;
        }
      });
    });
    waits(50);
    runs(function () {
      expect(proof).toBe(true);
    });
  });

  it("should keep the entry.", function () {
    var proof = false;
    runs(function() {
      users.find({name: 'test'}, function (error, results) {
        if (!error) {
          console.log(results);
          proof = true;
        }
      });
    });
    waits(50);
    runs(function () {
      expect(proof).toBe(true);
    });
  });
});
