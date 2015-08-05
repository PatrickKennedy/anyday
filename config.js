require('sugar');

var config = require('./config.json')
    , local = require('./local.json')
    ;

config = Object.merge(config, local);

config.rethinkdb.host = process.env.RETHINKDB_HOST || config.rethinkdb.host
config.rethinkdb.port = process.env.RETHINKDB_PORT || config.rethinkdb.port

module.exports = config;
