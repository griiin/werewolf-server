var server = require('./lib/server.js');
var options = {
  dbname: 'werewolf-dev-0001',
  dbhost: '127.0.0.1',
  dbport: 27017,
  socketport: 4242
};
server = new server(options);
server.run();
