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
	var camera = init_camera();

	// Geometry
	var floor = new Entity(grid(), undefined, mat4.create(), function plane(ray) {
		var t = vec4.dot(ray.p, Z) / vec4.dot(ray.u, _Z);
		if (t < 0) return null;
		var origin = vec4.create();
		vec4.scaleAndAdd(origin, ray.p, ray.u, t);
		return new Hit(ray, origin, vec4.clone(Z), vec4.clone(ray.u), PEWTER);
	});
	buffers.arrayDraw(floor, 'LINES');
	tracer.register(floor);

	var axes = new Entity([
		0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 1.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
	], undefined, mat4.create(), undefined);
	buffers.arrayDraw(axes, 'TRIANGLES');

	buffers.populate();

	var flag = true;

	// dat.GUI
	var panel = {
		Snap: function() {
			flag = true;
		}
	};
	var gui = new dat.GUI();
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
			tracer.snap(camera);
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