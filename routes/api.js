var express = require('express')
  , r = require('rethinkdb')
  , router = express.Router()
  ;

function getTableJSON(table) {
  return function(req, res, next){
    r
    .db('anyday')
    .table(table)
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
  .get('/task-fixtures/', getTableJSON('task_fixtures'))
  
  /*
   * GET /tasks/ returns a list of task objects
   */
  .get('/tasks/', getTableJSON('tasks'))

  /*
   * POST /tasks/ creates a task and returns the result
   */
  .post('/tasks/', function(req, res, next) {
    var task = req.body;
    task.when = r.ISO8601(task.when);
    task.createdAt = r.now();

    console.dir(task);

    r
    .db('anyday')
    .table('tasks')
    .insert(task, {returnChanges: true})
    .run(req.app._rdbConn, function(err, result) {
      if(err) {
        return next(err);
      }

      res.json(result);
    });
  })


  /*
   * Task Sepcific Functions
   *
   * GET /tasks/:id returns the sepcific task
   */
  .get('/tasks/:id', function(req, res, next) {
    var id = req.params.id;
  })

  /*
   * PUT /tasks/:id updates the specified task
   */
  .put('/tasks/:id', function(req, res, next) {
    var id = req.params.id
      , body = req.body
      ;

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
  })
;

module.exports = router;
