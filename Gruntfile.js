var fs = require('fs')
  , config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')), 'utf8')
  ;


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

    exec: {
      install_fixture: {
        cmd: function(fixture) {
          var cmd = [
            'rethinkdb import',
            '-c '+ config.rethinkdb.host +':'+ config.rethinkdb.port,
            '--table anyday.'+ fixture,
            '-f ./fixtures/'+ fixture +'.json',
            '--format json',
          ]
          return cmd.join(' ')
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-exec');
  
  grunt.registerTask('install-fixture', []);

  // Default task(s).
  grunt.registerTask('default', []);

};
