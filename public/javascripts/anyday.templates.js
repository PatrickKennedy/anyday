angular.module('anyday.templates', ['any-task-bottom-sheet.jade', 'any-task.jade', 'details.jade', 'fixtures.jade', 'login.jade', 'panel.jade', 'sidenav.jade', 'tasks.jade']);

angular.module("any-task-bottom-sheet.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("any-task-bottom-sheet.jade",
    "<md-bottom-sheet layout=\"row\" controller=\"AnyTasksBottomSheetController as vm\" class=\"md-grid\"><md-list flex layout=\"row\" layout-align=\"center center\"><md-list-item ng-repeat=\"item in vm.items\"><md-button ng-click=\"vm.menu_click($index)\" class=\"md-grid-item-content\"><md-icon md-font-icon=\"material-icons\">{{ item.icon }}</md-icon><div class=\"md-grid-text\">{{ item.name }}</div></md-button></md-list-item></md-list></md-bottom-sheet>");
}]);

angular.module("any-task.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("any-task.jade",
    "<div layout=\"column\" class=\"md-list-item-text\"><h3>{{ task.name }}</h3><h4>{{ task.when.relative() }}</h4></div><md-divider></md-divider>");
}]);

angular.module("details.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("details.jade",
    "");
}]);

angular.module("fixtures.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("fixtures.jade",
    "<div id=\"fixtures\" layout=\"column\" ng-controller=\"AnyFixturesController as vm\"><div layout=\"column\" layout-align=\"start start\" layout-gt-sm=\"row\" layout-align-gt-sm=\"start center\" flex class=\"md-headline\">I want to<md-autocomplete md-floating-label=\"do something...\" md-autoselect=\"true\" md-select-on-match=\"false\" md-no-cache=\"true\" md-delay=\"150\" md-selected-item=\"vm.fixture\" md-search-text=\"vm.search_text\" md-items=\"fixture in vm.get_matches(vm.search_text)\" md-item-text=\"fixture.name\"><md-item-template><span md-highlight-text=\"vm.search_text\">{{ fixture.name }}</span></md-item-template></md-autocomplete>every<md-input-container><label>frequency</label><input any-number type=\"number\" name=\"frequency\" ng-model=\"vm.fixture.frequency\"></md-input-container>or so, days.</div><div layout=\"row\" layout-align=\"end center\" class=\"md-actions\"><md-button ng-click=\"vm.create_from_fixture()\">Make It So</md-button></div></div>");
}]);

angular.module("login.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login.jade",
    "<div layout=\"column\" class=\"md-subhead\"><form ng-hide=\"enter_token\" ng-submit=\"submit_login()\"><div layout=\"row\" layout-align=\"start center\">Hi, you can call me<md-input-container><label>email</label><input type=\"text\" name=\"email\" ng-model=\"email\" placeholder=\"email\"></md-input-container>.</div><div ng-hide=\"enter_token\" layout=\"row\" layout-align=\"end center\" class=\"md-actions\"><md-button type=\"submit\">Login/Register</md-button></div></form><div ng-show=\"enter_token\" layout=\"row\" layout-align=\"start center\"><p>Enter the token you recieved here:</p><md-input-container><label>token</label><input type=\"text\" ng-model=\"token\" ng-keyup=\"$event.keyCode == 13 &amp;&amp; submit_token()\" placeholder=\"token\"></md-input-container></div></div><div ng-show=\"enter_token\" layout=\"row\" layout-align=\"end center\" class=\"md-actions\"><md-button ng-click=\"submit_token()\">Submit token</md-button><md-button ng-click=\"reset_token()\">Resend token</md-button></div>");
}]);

angular.module("panel.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("panel.jade",
    "");
}]);

angular.module("sidenav.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("sidenav.jade",
    "<md-sidenav layout-fill md-component-id=\"menu\" md-is-locked-open=\"$mdMedia('gt-md')\" class=\"md-sidenav-left md-whiteframe-z2\"><md-toolbar><div class=\"md-toolbar-tools\"><h1>Menu</h1><span flex></span><md-button hide-gt-md ng-click=\"toggle_sidenav()\" class=\"md-icon-button\"><md-icon aria-label=\"Close Menu\" md-font-icon=\"material-icons\">close</md-icon></md-button></div></md-toolbar><md-content layout=\"column\" layout-padding flex><md-button hide-gt-md ng-click=\"toggle_sidenav()\">Close Menu</md-button><md-divider></md-divider><md-button ng-if=\"config.user\" ng-click=\"logout()\">Logout</md-button></md-content></md-sidenav>");
}]);

angular.module("tasks.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("tasks.jade",
    "<div id=\"tasks\" ng-controller=\"AnyTasksController as vm\"><md-list><md-subheader class=\"md-no-sticky\">Tasks</md-subheader><md-list-item any-task ng-repeat=\"task in vm.tasks\" ng-click=\"vm.show_bottom_sheet($event, task)\" class=\"md-2-line\"><div class=\"md-list-item-text\"><h3>{{ task.name }}</h3><h4>{{ task.when.relative() }}</h4></div><md-icon aria-label=\"Update Time\" md-font-icon=\"material-icons\" ng-click=\"vm.update_time(task)\" class=\"md-secondary\">check</md-icon></md-list-item></md-list></div>");
}]);
