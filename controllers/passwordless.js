var passwordless = require('passwordless')
  , PasswordlessStore  = require('passwordless-rethinkdbstore')
  , fs = require('fs')
  , path = require('path')
  , r = require('rethinkdb')
  , User = require('../models/users')

  , config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')), 'utf8')
  ;

module.exports = function(app) {
  passwordless.init(
    new PasswordlessStore(config.rethinkdb),
    {
      allowGet: true,
      allowTokenReuse: true,
    }
  );

  passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
    console.log(tokenToSend);
    console.log(uidToSend);
    console.log(recipient);
    callback(null);
  });

  app.use(passwordless.sessionSupport());
  app.use(passwordless.acceptToken());

  // For every request: provide user data to the view
	app.use(function(req, res, next) {
    
		if(app._rdbConn && req.user) {
      User.get(req.user, app._rdbConn, function(err, user){
        if (err) return next(err);
        res.locals.user = user;
        next();
      })
		} else {
			next();
		}
	})
}
