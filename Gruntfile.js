module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    html2js: {
      options: {
        jade: {
          //this prevents auto expansion of empty arguments
          //e.g. "div(ui-view)" becomes "<div ui-view></div>"
          //     instead of "<div ui-view="ui-view"></div>"
          doctype: "html"
        }
      },
      main: {
        options: {
          base: '',
          module: 'anyday.templates'
        },
        src: ['./views/*.dir.jade'],
        dest: 'tmp/<%= pkg.name %>.templates.js'
      }
    },
    nodemon: {
      dev: {
        script: './bin/www',
        options: {
          delay: 500,
        }
      }
    },
  });

  // Load the plugin that provides the "html2js" task.
  grunt.loadNpmTasks('grunt-html2js');
  // Load the plugin that provides the "nodemon" task.
  grunt.loadNpmTasks('grunt-nodemon');

  // Default task(s).
  grunt.registerTask('default', []);

};
