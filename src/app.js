var log = require('./log.js');
var options = {
};
log = new log(options);

var easyMongo = require('easymongo');
var options = {
    dbname: 'werewolf-dev-0001',
    host: '127.0.0.1',
    port: 27017
};
var mongo = new easyMongo(options);
