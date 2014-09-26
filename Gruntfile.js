module.exports = function(grunt) {

  grunt.initConfig({

    jshint: {
      options: {
        curly: true,
        eqnull: true,
        eqeqeq: true,
        undef: true,
        globals: {
          'Q': true,
          'Visualforce': true,
          'module': true,
          'exports': true,
          'require': true,
          'window': true
        }
      },
      build: {
        files: {
          src: ['premote.js']
        }
      }
    },

    uglify: {
      options: {},
      build: {
        src: 'premote.js',
        dest: 'premote-min.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint:build', 'uglify:build']);

}
