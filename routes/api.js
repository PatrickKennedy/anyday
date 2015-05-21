var express = require('express')
  , r = require('rethinkdb')
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
      op = callback(op);

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
      op = callback(op);

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
   * Task Agnostic Functions
   *
   * GET /task-fixtures/ returns a list of task fixture objects
   */
  .get('/task-fixtures/', tableToJSON('task_fixtures', function(op){
    return op.orderBy({index: 'name'});
  }))
  
  /*
   * GET /tasks/ returns a list of task objects
   */
  .get('/tasks/', tableToJSON('tasks', function(op){
    return op.orderBy({index: 'when'});
  }))

  /*
   * POST /tasks/ creates a task and returns the result
   */
  .post('/tasks/', function(req, res, next) {
    var task = req.body;
    task.when = r.ISO8601(task.when);
    task.created = r.now();

    r
    .db('anyday')
    .table('tasks')
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


  /*
   * Task Sepcific Functions
   *
   * GET /tasks/:id returns the sepcific task
   */
  .get('/tasks/:id', function(req, res, next) {
    var id = req.params.id;

    r
    .db('anyday')
    .table('tasks')
    .get(id)
    .run(req.app._rdbConn, function(err, result) {
      if(err) return next(err);

      res.json(result);
    });
  })

  /*
   * PUT /tasks/:id updates the specified task
   */
  .put('/tasks/:id', function(req, res, next) {
    var id = req.params.id
      , body = req.body
      ;

    body.when = r.ISO8601(body.when);

    r
    .db('anyday')
    .table('tasks')
    .get(id)
    .update(body, {returnChanges: true})
    .run(req.app._rdbConn, function(err, result) {
      if(err) {
        return next(err);
      }

      res.json(result);
    });
  })

  /*
   * DELETE /tasks/:id deletes the specified task
   */
  .delete('/tasks/:id', function(req, res, next) {
    var id = req.params.id;
    
    r
    .db('anyday')
    .table('tasks')
    .get(id)
    .delete()
    .run(req.app._rdbConn, function(err, result) {
      if(err) return next(err);

      res.json(result);
    });
  })
;

module.exports = router;

