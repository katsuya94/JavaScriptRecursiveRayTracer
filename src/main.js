/* jshint strict: false */
/* global dat, mat4 */
/* global createProgram, resize */
/* global Buffers, Tracer, Entity, grid, init_camera */
/* exported main, canvas, gl, program */

var canvas;
var gl;

function main() {
	canvas = document.getElementById('webgl');
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

	var program_static = createProgram(document.getElementById('static-vs').text, document.getElementById('static-fs').text);
	var program_image = createProgram(document.getElementById('image-vs').text, document.getElementById('image-fs').text);

	gl.useProgram(program_static);
	var buffers	= new Buffers(program_static);
	gl.useProgram(program_image);
	var tracer	= new Tracer(program_image);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Set up Camera
	camera = init_camera();

	// Geometry
	geometry(buffers, tracer);
	buffers.populate();

	var flag = true;

	// dat.GUI
	var panel = {
		AntiAliasing: false,
		Detail: -1,
		Recursion: 0,
		Code: '',
		UseCode: function() {
			var array = this.Code.split(',').map(Number.parseFloat);
			quat.set(camera.rotate, array[0], array[1], array[2], array[3]);
			vec3.set(camera.position, array[4], array[5], array[6]);
		},
		Toggle: false,
		ContinuousDetail: -4,
		Snap: function() {
			flag = true;
		},
	};
	var gui = new dat.GUI();
	var config = gui.addFolder('Config');
	config.add(panel, 'AntiAliasing');
	config.add(panel, 'Detail', -8, 0).step(1);
	config.add(panel, 'Recursion', 0, 5).step(1);
	config.add(panel, 'Code').listen();
	config.add(panel, 'UseCode');
	var continuous = gui.addFolder('Continuous');
	continuous.add(panel, 'Toggle');
	continuous.add(panel, 'ContinuousDetail', -8, 0).step(1);
	gui.add(panel, 'Snap');

	gl.useProgram(program_static);

	var last = Date.now();

	var frame = function() {
		var now	= Date.now();
		var dt	= (now - last) / 1000.0;
		last 	= now;

		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.useProgram(program_static);
		gl.viewport(0, 0, gl.drawingBufferWidth/2, gl.drawingBufferHeight);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.buffer_vertex)
		gl.vertexAttribPointer(buffers.a_position, 3, gl.FLOAT, false, 6 * ASIZE, 0 * ASIZE);
		gl.vertexAttribPointer(buffers.a_color, 3, gl.FLOAT, false, 6 * ASIZE, 3 * ASIZE);

		camera.update(dt);
		buffers.draw(camera);

		if (flag) {
			flag = false;
			panel.Code = tracer.snap(panel.AntiAliasing, panel.Detail, panel.Recursion);
		}

		if (panel.Toggle) {
			panel.Code = tracer.snap(false, panel.ContinuousDetail, 0);
		}

		gl.useProgram(program_image);

		gl.bindBuffer(gl.ARRAY_BUFFER, tracer.buffer_rectangle);
		gl.vertexAttribPointer(tracer.a_rectangle, 2, gl.FLOAT, false, 4 * ASIZE, 0 * ASIZE);
		gl.vertexAttribPointer(tracer.a_texcoord, 2, gl.FLOAT, false, 4 * ASIZE, 2 * ASIZE);

		gl.viewport(gl.drawingBufferWidth / 2, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight);
		tracer.draw();

		window.requestAnimFrame(frame);
	};

	resize();

	window.requestAnimFrame(frame);
}