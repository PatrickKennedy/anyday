angular.module('anyday.templates', ['views/error.jade', 'views/index.jade', 'views/layout.jade']);

angular.module("views/error.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/error.jade",
    "<!DOCTYPE html><html><head><title></title><link rel=\"stylesheet\" href=\"/stylesheets/style.css\"></head><body><h1></h1></body></html>");
}]);

angular.module("views/index.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/index.jade",
    "<!DOCTYPE html><html><head><title></title><link rel=\"stylesheet\" href=\"/stylesheets/style.css\"></head><body><h1></h1><p>Welcome to </p></body></html>");
}]);

angular.module("views/layout.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("views/layout.jade",
    "<!DOCTYPE html><html><head><title></title><link rel=\"stylesheet\" href=\"/stylesheets/style.css\"></head><body></body></html>");
}]);
