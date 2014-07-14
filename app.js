var Server = require('./src/Server.js');
var options = {
  dbname: 'werewolf-dev-0001',
  dbhost: '127.0.0.1',
  dbport: 27017,
  socketport: 4242,
  verbose: true
};
server = new Server(options);
server.start();
