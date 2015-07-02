var express = require('express')
  , passwordless = require('passwordless')
  , r = require('rethinkdb')
  , User = require('../models/users')
  , router = express.Router()
  ;

/*
 * Convience function to templatize access to list of table items
 */
function tableToJSON(table, callback) {
  return function(req, res, next){
    op = r
    .db('anyday')
    .table(table)
    ;

    if (callback !== undefined)
      op = callback(op, req, res, next);

    op
    .run(req.app._rdbConn, function(err, cursor) {
      if(err) return next(err);

      //Retrieve all the todos in an array.
      cursor.toArray(function(err, result) {
        if(err) return next(err);
        res.json(result);
      });
    });
  }
}

/*
 * Convience function to templatize table interaction
 */
function interactToJSON(table, callback) {
  return function(req, res, next){
    op = r
    .db('anyday')
    .table(table)
    ;
    
    if (callback !== undefined)
      op = callback(op, req, res, next);

    op
    .run(req.app._rdbConn, function(err, result) {
      if(err) return next(err);

      res.json(result);
    });
  }
}

/*
 * All API routes prefixed by /api/v1/
 */
router
  /*
   * API Documentation
   */
  .get('/', function(req, res, next) {
    res.render('api-docs', { title: 'API Documentation' });
  })

  /*
   * GET /task-fixtures/ returns a list of task fixture objects
   */
  .get('/task-fixtures/', tableToJSON('task_fixtures', function(op){
    return op.orderBy({index: 'name'});
  }))
;

/*
 * Task Agnostic Functions
 */
router.route('/tasks/')

  /*
   * GET /tasks/ returns a list of task objects
   */
  .get(tableToJSON('tasks', function(op, req){
    op = op.getAll(req.user, {index: 'user_id'});
    op = op.orderBy('when');
    return op;
  }))

  /*
   * POST /tasks/ creates a task and returns the result
   */
  .post(function(req, res, next) {
    var task = req.body;
    task.user_id = req.user;
    task.when = r.ISO8601(task.when);
    task.created = r.now();

    r
    .db('anyday')
    .table('tasks')
    .getAll(req.user, {index: 'user_id'})
    .filter({name: task.name})
    .isEmpty()
    .run(req.app._rdbConn, function(err, empty){
      if(err) return next(err);
      if (empty) {
        r
        .db('anyday')
        .table('tasks')
        .insert(task, {returnChanges: true})
        .run(req.app._rdbConn, function(err, result) {
          if(err) return next(err);

          res.json(result);
        });
      }
    })
  })
;

/*
 * Task Sepcific Functions
 */
router.route('/tasks/:id')

  /*
   * GET /tasks/:id returns the sepcific task
   */
  .get(interactToJSON('tasks', function(op, req){
    var id = req.params.id;
    return op.get(id);
  }))

  /*
   * PUT /tasks/:id updates the specified task
   */
  .put(interactToJSON('tasks', function(op, req){
    var id = req.params.id
      , body = req.body
      ;

    // convert text timestamp to native rdb tamestamp
    body.when = r.ISO8601(body.when);

    return op
    .get(id)
    .update(body, {returnChanges: true})
  }))

  /*
   * DELETE /tasks/:id deletes the specified task
   */
  .delete(interactToJSON('tasks', function(op, req){
    var id = req.params.id;
    return op.get(id).delete();
  }))
;


/*
 * Auth Functions
 */
router
  /*
   * GET login screen
   */
  .get('/login', function(req, res) {
    res.render('auth', { user: req.user });
  })

  /*
   * GET logout
   */
  .get('/logout', passwordless.logout(), function(req, res) {
    res.json({result:'success'});
  })

  /*
   * GET login url
   */
  .get('/tokenlogin', function(req, res) {
    var email = req.query.email
        , token = req.query.token
        ;
    User.getByEmail(email, req.app._rdbConn, function(err, user) {
      if(err) return callback(err);
      if(user) return res.json({url:'/?uid='+ user.id +'&token='+ token});
    })
  })


  /*
   * POST login screen
   */
  .post('/sendtoken',
    // Input validation
    function(req, res, next) {
      req.checkBody('email', 'Please provide a valid email address').isLength(1,200).isEmail();
      req.sanitize('email').toLowerCase();
      req.sanitize('email').trim();

      var errors = req.validationErrors(true);
      if (errors)
        res.json({result:'error', errors:errors});
      else
        next();
    },

    // wrap requestToken to provide access to req.app._rdbConn
    function(req, res, next) {
      passwordless.requestToken(
        function(email, delivery, callback) {
          console.log(email)
          console.log(delivery)

          User.getOrCreate(email, req.app._rdbConn, function(err, user) {
            if(err) return callback(err);
            return callback(null, user.id);
          })
        },
        {
          userField: 'email',
        }
      )(req, res, next);
    },

    function(req, res, next) {
      res.json({result:'success'});
    }
  );

module.exports = router;



