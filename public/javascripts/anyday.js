(function(angular){
    var app = angular.module('anyday', []);

    app
        .controller('AnydayController', ['$scope', function($scope) {
            $scope.tasks = [
                {
                    name: "Shower",
                    last: Date.past('yesterday'),
                },
                {
                    name:"Water Plants",
                    last: Date.past('Monday'),
                }
            ]

            $scope.update_time = function (){
                $scope.tasks[this.$index].last = Date.create('now');
                console.log($scope.tasks)
            }
        }])
        .directive('anyTask', [
            function () {
                return {
                    scope: {
                        task: '=',
                    },
                    template: '{{ task.name }} - <any-time-since></any-time-since>'
                }
            }
        ])
        .directive('anyTimeSince', ['$interval',
            function($interval){
                return function (scope, element, attrs){
                    var interval;

                    function updateTime(){
                        element.text(scope.task.last.relative());
                    }

                    interval = $interval(function() {
                        updateTime();
                    }, 5000);

                    scope.$watch(scope.task.last, function(){
                        updateTime();
                    });

                    element.on('$destroy', function(){
                        $interval.cancel(interval);
                    });
                }
            }
        ])
        ;
}(angular));
