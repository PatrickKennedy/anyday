(function(angular){
  /*
   * AnyConfig module
   * Contains server-side configuration variables
   */
  angular.module('any.config', [])
    .provider('AnyConfig', function () {
      var config = Object.extended({
         user: null,
      });
      return {
         set: function (diff) {
           config = config.merge(diff);
         },
         $get: function () {
           return config;
         }
      };
    });

  /*
   * AnyApi module
   * Contains all logic related to the api functionality
   */
  angular.module('any.api', [])
    .factory('AnyAPI', [
      '$http',
      function ($http) {
      var prefix = '/api/v1';
      return {
       fixtures: function () {
        var url = prefix+'/task-fixtures/';
        return $http.get(url);
       },
       tasks: function () {
        var url = prefix+'/tasks/';
        return $http.get(url);
       },
       create: function (task) {
        var url = prefix+'/tasks/';
        return $http.post(url, task);
       },
       update: function (task) {
        var url = prefix+'/tasks/' + task.id;
        return $http.put(url, task);
       },
       delete: function(id) {
        var url = prefix+'/tasks/' + id;
        return $http.delete(url);
       },
       sendtoken: function(email) {
        var url = prefix+'/sendtoken/';
        return $http.post(url, {email: email});
       },
       tokenlogin: function(email, token) {
        var url = prefix+'/tokenlogin/';
        return $http.get(url, {params: {email: email, token: token}});
       }
      };
     }
    ])
  ;

  /*
   * AnyLogin module
   * Contains all logic related to the login functionality
   */
  angular.module('any.login', ['any.api', 'anyday.templates', 'login.jade'])
    .controller('AnyLoginFormController', [
      '$scope', '$location', 'AnyAPI',
      function($scope, $location, api) {
        $scope.enter_token = false;
        $scope.reset_token = function (){ $scope.enter_token = false; }
        $scope.submit_login = function (){
          console.log('attempting to send token');
          if ($scope.email) {
            api.sendtoken($scope.email)
            .success(function(result){
              console.log('token sent successfully');
              $scope.enter_token = true;
            })
            .error(function(error){
              console.log('token failed to send: '+ error);
            })
            ;
          }
        }
        $scope.submit_token = function (){
          console.log('attempting to submit token');
          if ($scope.email) {
            api.tokenlogin($scope.email, $scope.token)
            .success(function(result){
              console.log('token login url retrieved successfully: '+ result.url);
              location.replace(result.url);
              //$location.path(result.url)
            })
            .error(function(error){
              console.log('token failed to retrieve: '+ error);
            })
            ;
          }
        }
      }
    ])
    .directive('anyLoginForm', [
      function () {
        return {
          templateUrl: 'login.jade',
        }
      }
    ])
  ;

  /*
   * AnyTasks module
   * Contains the display logic for the task lists
   */
  angular.module('any.tasks', ['any.api', 'anyday.templates', 'tasks.jade', 'any-task.jade'])
    .controller('AnyTasksController', [
      '$scope', 'AnyAPI',
      function($scope, api) {
        $scope.tasks = [];
        api.tasks().success(function(result) {
          $scope.tasks = result;
        }).error(function(error){
          console.log(error);
        });

        $scope.update_time = function (){
          var task = $scope.tasks[this.$index]
            , old_when = task.when
            ;
          task.when = Date.create('now');
          api.update(task).success(function(result) {
            console.log(result);
          }).error(function(error){
            task.when = old_when;
            console.log(error);
          });
        }
      }
    ])
    .directive('anyTasksList', [
      function () {
        return {
          templateUrl: 'tasks.jade',
          controller: 'AnyTasksController',
        }
      }
    ])
    .directive('anyTask', [
      function () {
        return {
          scope: {
            task: '=',
          },
          //TODO: Decrease .relative's granularity
          // see: http://sugarjs.com/api/Date/relative
          templateUrl: 'any-task.jade',
          link: function(scope, element, attrs) {
            scope.task.when = Date.create(scope.task.when);
          }
        }
      }
    ])
  ;

  /*
   * AnyPanel module
   * Contains any panel related logic
   * Fixtures and Details panes will be displayed here
   */
  angular.module('any.panel', ['anyday.templates', 'panel.jade'])
    .controller('AnyPanelController', [

    ])
    .directive('anyPanel', [
      function () {
        return {
          transclude: true,
          templateUrl: 'panel.jade',
        }
      }
    ])
  ;

  /*
   * AnyFixtures module
   * Contains the display logic for the fixture list
   */
  angular.module('any.fixtures', ['any.api', 'anyday.templates', 'fixtures.jade'])
    .controller('AnyFixturesController', [
      '$scope', 'AnyAPI',
      function($scope, api) {
        $scope.task_fixtures = []
        $scope.fixture = {}
        api.fixtures().success(function(result) {
          $scope.task_fixtures = result;
        }).error(function(error){
          console.log(error);
        });

        function _create_task(task) {
          api.create(task).success(function(result) {
            $scope.tasks.push(task);
            console.log(result);
          }).error(function(error){
            console.log(error);
          });
        }

        $scope.transform_tag = function(new_tag){
          console.log("transforming tag")
          return {
            id: undefined,
            name: new_tag,
            frequency: 1,
          };
        }

        $scope.create_from_fixture = function (){
          var fixture = $scope.task_fixtures[this.$index]
            , task = angular.copy(fixture)
            ;

          delete task.id;
          task.when = Date.create('now');
          _create_task(task);
        }

        $scope.create_custom = function (){
          _create_task({
            name: $scope.custom_name,
            when: Date.create('now'),
          });
        }
      }
    ])
    .directive('anyFixturesList', [
      function () {
        return {
          templateUrl: 'fixtures.jade',
          controller: 'AnyFixturesController',
        }
      }
    ])
    .directive('anyFixture', [
      function () {
        return {
          scope: {
            fixture: '=',
          },
          template: '{{ fixture.name }}',
        }
      }
    ])
    .directive('anyNumber', [
      function() {
        return {
          require: 'ngModel',
          link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
              return '' + value;
            });
            ngModel.$formatters.push(function(value) {
              return parseFloat(value, 10);
            });
          }
        }
      }
    ])
  ;

  /*
   * AnyDetails module
   * Contains the display logic for the task details pane
   */
  angular.module('any.details', ['any.api', 'anyday.templates', 'details.jade'])
    .controller('AnydetailsController', [

    ])
    .directive('anyDetailPane', [
      function () {
        return {
          scope: {
            task: '=',
          },
          templateUrl: 'details.jade',
        }
      }
    ])
  ;

  /*
   * Anyday module
   * Contains core website logic
   */
  angular.module(
    'anyday',
    [
     'any.api', 'any.login', 'any.tasks', 'any.fixtures', 'any.details',
     'ngSanitize', 'ui.select'
    ]
  )
    .controller('AnydayController', [
      '$scope', 'AnyAPI',
      function($scope, api) {
      //$scope.tasks = [
      //  {
      //    name: "Shower",
      //    when: Date.past('yesterday'),
      //  },
      //  {
      //    name:"Water Plants",
      //    when: Date.past('Monday'),
      //  }
      //]

      //$scope.task_fixtures = []
      //api.fixtures().success(function(result) {
      //  $scope.task_fixtures = result;
      //}).error(function(error){
      //  console.log(error);
      //});
    }])
  ;
}(angular));
