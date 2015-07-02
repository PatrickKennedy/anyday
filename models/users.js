require('sugar');

var is = require('is_js')
  , r = require('rethinkdb')
  ;

var User = function (obj){
  this.id = obj.id;
  this.email = obj.email;
  this.created_at = obj.created_at;
}

User.schema = Object.extended({
  email: '',
  created_at: r.now,
})

User.get = function (id, conn, done) {
  r
  .table('users')
  .get(id)
  .run(conn, function(err, result) {
    if (err) return done(err);
    if (result) return done(null, new User(result));
    return done(null, null);
  });
}

User.getByEmail = function (email, conn, done) {
  email = email.toLowerCase().trim();

  r
  .table('users')
  .getAll(email, {index: 'email'})
  .run(conn, function(err, cursor) {
    if (err) return done(err);
    cursor.toArray(function(err, result) {
      if (err) return done(err);
      if (result.length)
        return done(null, new User(result[0]));
      else
        return done(null, null);
    });
  });
}


User.getOrCreate = function (email, conn, done) {
  User.getByEmail(email, conn, function(err, user){
    if (err) return done(err);
    if (user) return done(null, user);

    user = User.schema.merge({
      email: email,
    })
    user = user.map(function(k, v) {
      if (is.function(v)) return v();
      return v;
    })

    r
    .table('users')
    .insert(user)
    .run(conn, function(err, result){
      if(err) return done(err);
      user.id = result.generated_keys[0];
      return done(null, new User(user))
    })

  });
}


module.exports = User;
