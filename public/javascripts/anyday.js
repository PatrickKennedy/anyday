(function(angular){
    /*
     * AnyConfig module
     * Contains server-side configuration variables
     */
    angular.module('any.config', [])
        .provider('AnyConfig', function () {
            var config = Object.extend({
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
        .controller('AnydayLoginFormController', [
            '$scope', 'AnyAPI',
            function($scope, api) {
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
     * Anyday module
     * Contains core website logic
     */
    angular.module('anyday', ['any.api', 'any.login', 'anyday.templates', 'login.jade'])
        .controller('AnydayController', [
            '$scope', 'AnyAPI',
            function($scope, api) {
            //$scope.tasks = [
            //    {
            //        name: "Shower",
            //        when: Date.past('yesterday'),
            //    },
            //    {
            //        name:"Water Plants",
            //        when: Date.past('Monday'),
            //    }
            //]

            $scope.task_fixtures = []
            api.fixtures().success(function(result) {
                $scope.task_fixtures = result;
            }).error(function(error){
                console.log(error);
            });

            $scope.tasks = []
            api.tasks().success(function(result) {
                $scope.tasks = result;
            }).error(function(error){
                console.log(error);
            });

            $scope.create_task = function (){
                var fixture = $scope.task_fixtures[this.$index]
                    , task = angular.copy(fixture)
                    ;

                delete task.id;
                task.when = Date.create('now');
                api.create(task).success(function(result) {
                    $scope.tasks.push(task);
                    console.log(result);
                }).error(function(error){
                    console.log(error);
                });
            }

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
        }])
        
        .directive('anyFixture', [
            function () {
                return {
                    scope: {
                        fixture: '=',
                    },
                    template: '{{ fixture.name }}'
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
                    template: '{{ task.name }} - {{ task.when.relative() }}',
                    link: function(scope, element, attrs) {
                        scope.task.when = Date.create(scope.task.when);
                    }
                }
            }
        ])
    ;
}(angular));

