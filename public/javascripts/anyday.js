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
                    //TODO: Decrease .relative's granularity
                    // see: http://sugarjs.com/api/Date/relative
                    template: '{{ task.name }} - {{ task.last.relative() }}'
                }
            }
        ])
        ;
}(angular));
