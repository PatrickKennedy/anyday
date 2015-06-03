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
  .get(tableToJSON('tasks', function(op){
    return op.orderBy({index: 'when'});
  }))

  /*
   * POST /tasks/ creates a task and returns the result
   */
  .post(function(req, res, next) {
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

module.exports = router;

