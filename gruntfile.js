module.exports = function(grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    express: {
      all: {
        options: {
          port: 9000,
          hostname: "localhost",
          bases: [__dirname],
          livereload: true
        }
      }
    },
    watch: {
      all: {
        files: ['**/*.html', '**/*.js', '**/*.scss'],
        options: {
          livereload: true
        },
      },
      css: {
        files: ['css/main.scss'],
        tasks: ['sass'],
        options: {
          spawn: false,
        }
      }
    },
    open: {
      all: {
        path: 'http://localhost:<%= express.all.options.port%>'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/main.css': 'css/main.scss'
        }
      }
    }
  });

  grunt.registerTask('default', [
    'express',
    'open',
    'watch',
    'sass',
  ]);

};