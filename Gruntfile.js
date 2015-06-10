var config = require('./config');

module.exports = function(grunt) {
  var plugins = require('matchdep').filterDev('grunt-*');
  plugins.forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      jade: {
        files: ['./public/views/*.jade'],
        tasks: ['html2js'],
        options: {
          spawn: false,
        }
      }
    },

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
          base: './public/views',
          module: 'anyday.templates'
        },
        src: ['./public/views/*.jade'],
        dest: './public/javascripts/<%= pkg.name %>.templates.js'
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon', 'node-inspector', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    "node-inspector": {
      dev: {
        options: {
          'save-live-edit': true,
          'no-preload': true,
          'hidden': ['node_modules'],
        }
      }
    },

    nodemon: {
      dev: {
        script: './bin/www',
        options: {
          delay: 500,
          nodeArgs: ['--debug'],
          ignore: ['node_modules/**', 'public/javascripts/**'],
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

  //grunt.loadNpmTasks('grunt-html2js');
  //grunt.loadNpmTasks('grunt-concurrent');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-node-inspector');
  //grunt.loadNpmTasks('grunt-nodemon');
  //grunt.loadNpmTasks('grunt-exec');
  
  grunt.registerTask('install-fixture', []);

  // Default task(s).
  grunt.registerTask('default', []);

};
