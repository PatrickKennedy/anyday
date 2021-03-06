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
       },
       logout: function() {
        var url = prefix+'/logout/';
        return $http.get(url);
       },
      };
     }
    ])
  ;

  /*
   * AnyLogin module
   * Contains all logic related to the login functionality
   */
  angular.module('any.login', ['login.jade'])
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
          controller: 'AnyLoginFormController',
        }
      }
    ])
  ;

  /*
   * AnySidenav module
   * Contains the display logic for the task details pane
   */
  angular.module('any.sidenav', ['sidenav.jade'])
    .controller('AnySidenavController', [
      '$scope', 'AnyAPI',
      function ($scope, api) {
        $scope.logout = function() {
          api.logout()
          .success(function(result) {
            console.log('logged out : '+ result.result);
            location.replace('/');
          });
        }
      }
    ])
    .directive('anySidenav', [
      'AnyConfig',
      function (config) {
        return {
          templateUrl: 'sidenav.jade',
          controller: 'AnySidenavController',
        }
      }
    ])
  ;

  /*
   * AnyTasks module
   * Contains the display logic for the task lists
   */
  angular.module('any.tasks', ['tasks.jade', 'any-task.jade'])
    .controller('AnyTasksController', [
      '$scope', '$filter', '$mdBottomSheet', 'AnyAPI',
      function($scope, $filter, $mdBottomSheet, api) {
        var vm = this;
        vm.tasks = [];
        vm.grouped_tasks = {
          overdue: {},
          today: {},
          soon: {},
          this_week: {},
          this_month: {},
          sometime: {},
        };
        vm.current_group = null;
        api.tasks().success(function(result) {
          vm.tasks = prep_result(result);
          _order_tasks();
        }).error(function(error){
          console.log(error);
        });

        function prep_result(tasks) {
          return tasks.map(function(task) {
            return _prep_task(task)
          })
        }

        function _prep_task(task) {
          task.when = Date.create(task.when);
          task.time_left = task.frequency - task.when.daysAgo();

          return task;
        }

        function _clean_task(task) {
          delete task.time_left;
          return task;
        }
        
        // changes to task properties won't trigger a reorder on the task list
        function _order_tasks() {
          return $filter('orderBy')(vm.tasks, 'time_left');
        }

        $scope.$on('any:new-task', function(event, task){
          vm.tasks.push(_prep_task(task));
          // order tasks here because it's not handled by the template anymore
          _order_tasks();
        })

        vm.get_timestamp = function (time_left, last) {
          var group = ''
            , groups = [
            function overdue(days) { return days < 0 ? 'overdue' : '' },
            function today(days) { return (days >= 0 && days < 1) ? 'today' : '' },
            function soon(days) { return (days >= 1 && days < 4) ? 'soon' : '' },
            function this_week(days) { return (days >= 4 && days < 8) ? 'this week' : '' },
            function this_month(days) { return (days >= 8 && days < 31) ? 'this month' : '' },
            function sometime(days) { return (days >= 31) ? 'sometime' : '' },
          ];
          for (var i = 0; i < groups.length; i++) {
            group = groups[i](time_left);
            if (group)
              break;
          }
          if (group == vm.current_group)
            return '';

          vm.current_group = last ? null : group;
          return group;
        }

        vm.update_time = function (task, past){
          var old_task = Object.clone(task, true);

          if (past)
            task.when = Date.create(past + 'days ago');

          delta_days = task.when.hoursAgo() / 24;

          if (!past)
            task.when = Date.create('now');

          task.frequency = ((task.frequency + delta_days)/2).round(2);
          task.time_left = task.frequency - task.when.daysAgo();

          api.update(_clean_task(Object.clone(task, true))).success(function(result) {
            console.log(result);
            // Resort the list because it itself isn't being updated it won't get digested
            _order_tasks();
          }).error(function(error){
            task = old_task;
            console.log(error);
          });
        }

        vm.delete_task = function (task){
          api.delete(task.id).success(function(result) {
            if (result.deleted == 1) {
              vm.tasks.splice(vm.tasks.indexOf(task), 1);
            }
            console.log(result);
          }).error(function(error){
            console.log(error);
          });
        }

        vm.show_bottom_sheet = function($event, task) {
          $mdBottomSheet.show({
            locals: { options: {update_time: vm.update_time, delete_task: vm.delete_task} },
            templateUrl: 'any-task-bottom-sheet.jade',
            controller: 'AnyTasksBottomSheetController',
            controllerAs: 'vm',
            targetEvent: $event,
          }).then(function(clicked_item){
            clicked_item.fn(task);
          })
        }
      }
    ])
    .controller('AnyTasksBottomSheetController', [
      '$mdBottomSheet', 'options',
      function($mdBottomSheet, options) {
        var vm = this;
        vm.items = [
          { name: 'Complete', icon: 'check', fn: options.update_time },
          { name: 'Delete', icon: 'delete', fn: options.delete_task },
        ];
        vm.menu_click = function($index) {
          var clicked_item = vm.items[$index];
          $mdBottomSheet.hide(clicked_item);
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
          //TODO: Decrease .relative's granularity
          // see: http://sugarjs.com/api/Date/relative
          link: function(scope, element, attrs) {
            scope.task.when = Date.create(scope.task.when);
          }
        }
      }
    ])
  ;

  /*
   * AnyFixtures module
   * Contains the display logic for the fixture list
   */
  angular.module('any.fixtures', ['fixtures.jade'])
    .controller('AnyFixturesController', [
      '$rootScope', 'AnyAPI',
      function($rootScope, api) {
        var vm = this;
        vm.task_fixtures = [];
        vm.fixture;
        vm.search_text = null;
        api.fixtures().success(function(result) {
          vm.task_fixtures = result;
        }).error(function(error){
          console.log(error);
        });

        function _create_task(task) {
          api.create(task).success(function(result) {
            $rootScope.$broadcast('any:new-task', result.changes[0].new_val)
            console.log(result);
          }).error(function(error){
            console.log(error);
          });
        }

        vm.get_matches = function(search_text) {
          var query
              , results
              , custom_result
              ;

          search_text = search_text.trim();
          query = angular.lowercase(search_text);

          results = query ? vm.task_fixtures.filter(function(fixture) {
            return (fixture.name.toLowerCase().indexOf(query) === 0);
          }) : vm.task_fixtures;

          if (search_text && results.length <= 0) {
            custom_result = {
              id: '',
              name: search_text,
              frequency: 1
            };
            results.unshift(custom_result);
            vm.fixture = custom_result;
          }

          return results;
        }

        vm.create_from_fixture = function (){
          var task = angular.copy(vm.fixture);

          // return if the task hasn't been generated
          if (task === null)
            return;

          delete task.id;
          task.when = Date.create('now');
          _create_task(task);
        }
      }
    ])
    .filter('default', function () {
      return function (item, def) {
        if (item !== undefined)
          return item;
        return def;
      }
    })
    .directive('anyFixturesList', [
      function () {
        return {
          templateUrl: 'fixtures.jade',
          controller: 'AnyFixturesController',
          controllerAs: 'vm',
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
  angular.module('any.details', ['details.jade'])
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
     'any.api', 'any.config', 'any.login', 'any.fixtures', 'any.tasks', 'any.sidenav',
     'anyday.templates', 'ngMaterial',
    ]
  )
    .controller('AnydayController', [
      '$scope', '$mdSidenav', 'AnyAPI', 'AnyConfig',
      function($scope, $mdSidenav, api, config) {
        $scope.config = config;
        $scope.toggle_sidenav = function() {
          $mdSidenav('menu').toggle();
        };
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
