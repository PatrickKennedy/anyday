(function(angular){
    var app = angular.module('anyday', []);

    app
        .controller('AnydayController', ['$scope', 'AnyAPI', function($scope, api) {
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
        .factory('AnyAPI', function ($http) {
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
              }
            };
          })
        ;
}(angular));
