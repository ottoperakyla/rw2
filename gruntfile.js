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
        files: ['**/*.html', '**/*.js', '**/*.less'],
        options: {
          livereload: true
        },
      },
      css: {
        files: ['css/styles.less'],
        tasks: ['less'],
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
    less: {
      development: {
        options: {
          paths: ['css'],
          compress: true,
          sourceMap: true,
        },
        files: {
          'css/styles.css': 'css/styles.less'
        },
      }
    }
  });

  grunt.registerTask('default', [
    'express',
    'open',
    'watch',
    'less',
  ]);

};