require('sugar');

var config = require('./config.json')
    , local = {}
    ;

try {
  local = require('./local.json');
} catch (err) {
  if (err.code != "MODULE_NOT_FOUND") {
    throw err
  }
  console.log(err.code)
}

config = Object.merge(config, local);

config.rethinkdb.host = process.env.RETHINKDB_HOST || config.rethinkdb.host
config.rethinkdb.port = process.env.RETHINKDB_PORT || config.rethinkdb.port

module.exports = config;
