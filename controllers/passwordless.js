var passwordless = require('passwordless')
  , PasswordlessStore  = require('passwordless-rethinkdbstore')
  , Mailgun = require('mailgun-js')
  , fs = require('fs')
  , path = require('path')
  , r = require('rethinkdb')
  , User = require('../models/users')

  , config = require('../config')
  ;

module.exports = function(app) {
  passwordless.init(
    new PasswordlessStore(config.rethinkdb),
    {
      allowGet: true,
      allowTokenReuse: true,
    }
  );

  //passwordless.addDelivery('console',
  //  function(tokenToSend, uidToSend, recipient, callback) {
  //  console.log(tokenToSend);
  //  console.log(uidToSend);
  //  console.log(recipient);
  //  callback(null);
  //});

  passwordless.addDelivery(
    function(tokenToSend, uidToSend, recipient, callback) {
      console.log(tokenToSend);
      console.log(uidToSend);
      console.log(recipient);


      var mailgun = new Mailgun({apiKey: config.email.api_key, domain: config.email.domain});

      var data = {
        from: config.email.sender,
        to: recipient,
        subject: 'Hello from Anyday',
        html: 'Hello! Here is your token:'+ tokenToSend +'. Or click here to login: <a href="http://anyday.dokku.dysio.de/?uid='+ uidToSend +'&token='+ tokenToSend +'">Click here to login!</a>'
      }

      mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
          console.log("got an error: ", err);
          return callback(err);
        }
        callback(null);
      });
    }, { ttl: 60*60*24*30 }
  );

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
