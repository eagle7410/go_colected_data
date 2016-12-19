/**
 * Created by igor on 26.07.16.
 */
module.exports = function(grunt) {

	grunt.initConfig({
		concat: {

			js: {
				src: [
					'./public/bower_components/jquery/dist/jquery.min.js',
					'./public/bower_components/bootstrap/dist/js/bootstrap.min.js',
					'./public/bower_components/bootstrap-sweetalert/dist/sweetalert.min.js',
					'./public/bower_components/doT/doT.min.js',
					'./public/js/jquery.doT.plugin.js',
					'./public/js/jquery.ajaxHelper.js'
				],
				dest: './public/assets/js/utils.js'
			},
			css : {
				src: [
					'./public/bower_components/bootstrap/dist/css/bootstrap.min.css',
					'./public/bower_components/components-font-awesome/css/font-awesome.min.css',
					'./public/bower_components/bootstrap-sweetalert/dist/sweetalert.css'

				],
				dest: './public/assets/css/style.css'
			},
			cssLogin : {
				src: [
					'./public/bower_components/bootstrap/dist/css/bootstrap.min.css',
					'./public/css/login.css'
				],
				dest: './public/assets/css/login.css'
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			js: {
				files: {
					'./public/assets/js/utils.min.js': ['./public/assets/js/utils.js']
				}
			}
		},
		cssmin: {
			style: {
				files: {
					'./public/assets/css/style.min.css': ['./public/assets/css/style.css']
				}
			},
			login: {
				files: {
					'./public/assets/css/login.min.css': ['./public/assets/css/login.css']
				}
			}
		},
		default : ['concat', 'uglify', 'cssmin']
	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};



