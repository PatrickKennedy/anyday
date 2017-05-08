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
}

config = Object.merge(config, local, true);

config.rethinkdb.host = process.env.DOKKU_RETHINKDB_ANYDAY_PORT_28015_TCP_HOST || config.rethinkdb.host
config.rethinkdb.port = process.env.DOKKU_RETHINKDB_ANYDAY_PORT_28015_TCP_PORT || config.rethinkdb.port

config.email.api_key = process.env.EMAIL_API_KEY || config.email.api_key
config.email.domain = process.env.EMAIL_DOMAIN || config.email.domain
config.email.sender = process.env.EMAIL_SENDER || "noreply@"+config.email.domain

module.exports = config;
