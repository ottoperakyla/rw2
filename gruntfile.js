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
        files: ['**/*.html', '**/*.js'],
        options: {
          livereload: true
        },
      }
    },
    open: {
      all: {
        path: 'http://localhost:<%= express.all.options.port%>'
      }
    }
  });

  grunt.registerTask('default', [
      'express',
      'open',
      'watch',
    ]);

};