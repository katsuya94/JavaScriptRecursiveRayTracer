/* jshint strict: false */
/* global dat */
/* global createProgram, resize */
/* global init_buffers, init_camera */
/* exported main, canvas, gl, program */

var canvas;
var gl;
var program;

function main() {
	canvas = document.getElementById('webgl');
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	program_static = createProgram(document.getElementById('static-vs').text, document.getElementById('static-fs').text);
	//program_image = createProgram(document.getElementById('image-vs').text, document.getElementById('image-fs').text);

	var buffers	= init_buffers(program_static);
	//var tracer	= init_tracer(program_image);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// dat.GUI
	var panel = {};
	var gui = new dat.GUI();

	// Set up Camera
	var camera = init_camera();

	// Geometry


	var last = Date.now();

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	var frame = function() {
		var now	= Date.now();
		var dt	= (now - last) / 1000.0;
		last 	= now;

		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		gl.viewport(0, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight);

		camera.update(dt);
		gl.uniformMatrix4fv(program.u_vp, false, camera.vp);

		gl.drawElements(gl.TRIANGLES, buffers.elements, gl.UNSIGNED_SHORT, 0);

		window.requestAnimFrame(frame);
	};

	resize();

	window.requestAnimFrame(frame);
}