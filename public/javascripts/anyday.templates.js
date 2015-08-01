angular.module('anyday.templates', ['details.jade', 'fixtures.jade', 'login.jade', 'panel.jade', 'tasks.jade']);

angular.module("details.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("details.jade",
    "");
}]);

angular.module("fixtures.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("fixtures.jade",
    "<div><ul><li><input type=\"text\" name=\"custom_name\" ng-model=\"custom_name\" ng-keyup=\"$event.keyCode == 13 &amp;&amp; create_custom()\"></li><li ng-repeat=\"fixture in task_fixtures\"><any-fixture fixture=\"fixture\" ng-click=\"create_from_fixture()\"></any-fixture></li></ul></div>");
}]);

angular.module("login.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login.jade",
    "<div ng-controller=\"AnyLoginFormController\"><form ng-submit=\"submit_login()\" ng-hide=\"enter_token\"><input type=\"text\" name=\"email\" ng-model=\"email\" placeholder=\"email\"><input type=\"submit\" value=\"Login/Register\"></form><div ng-show=\"enter_token\"><p>Enter the token you recieved here:</p><input type=\"text\" ng-model=\"token\" ng-keyup=\"$event.keyCode == 13 &amp;&amp; submit_token()\" placeholder=\"token\"><div><span ng-click=\"reset_token()\">Resend token?</span></div></div></div>");
}]);

angular.module("panel.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("panel.jade",
    "");
}]);

angular.module("tasks.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tasks.jade",
    "<div><ul><li ng-click=\"show_fixtures()\"><Add>New Task</Add></li><li ng-repeat=\"task in tasks\" ng-click=\"update_time()\"><any-task task=\"task\"></any-task></li></ul></div>");
}]);
