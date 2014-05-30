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
	var floor = new Entity(grid(), undefined, mat4.create(), function(ray) {
		var t = vec3.dot(ray.p, Z) / vec3.dot(ray.u, _Z);
		if (t < 0) return null;
		var origin = vec3.create();
		vec3.scaleAndAdd(origin, ray.p, ray.u, t);
		var m = (((Math.floor(origin[0]) + Math.floor(origin[1])) % 2) == 0) ? BLACK_PLASTIC : WHITE_PLASTIC;
		return new Hit(ray, origin, Z, m);
	});
	buffers.arrayDraw(floor, 'LINES');
	tracer.register(floor);

	var transform = mat4.create();
	mat4.scale(transform, transform, [3, 6, 3]);
	mat4.translate(transform, transform, [1, 0, 2]);
	var sphere = new Entity(undefined, undefined, transform, function(ray) {
		var a = ray.u[0] * ray.u[0] + ray.u[1] * ray.u[1] + ray.u[2] * ray.u[2];
		var b = 2 * (ray.p[0] * ray.u[0] + ray.p[1] * ray.u[1] + ray.p[2] * ray.u[2]);
		var c = ray.p[0] * ray.p[0] + ray.p[1] * ray.p[1] + ray.p[2] * ray.p[2] - 1;

		var t_1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		var t_2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

		var v_1 = vec3.create();
		if (t_1 && t_1 > 0) vec3.scaleAndAdd(v_1, ray.p, ray.u, t_1);

		var v_2 = vec3.create();
		if (t_2 && t_2 > 0) vec3.scaleAndAdd(v_2, ray.p, ray.u, t_2);

		var v;

		if (t_1 && t_1 > 0 && vec3.dot(v_1, ray.u) < 0) {
			v = v_1;
		} else if (t_2 && t_2 > 0) {
			v = v_2;
		}

		if (v) {
			m = (Math.floor(v[1] / 0.2) % 2) == 0 ? PEWTER : _PEWTER;
			var n = vec3.clone(v);
			return new Hit(ray, v, n, m);
		} else {
			return null;
		}
	});
	tracer.register(sphere);

	tracer.light(new Light(
		vec3.fromValues(20.0, 0.0, 20.0),
		vec3.fromValues(0.25, 0.25, 0.25),
		vec3.fromValues(0.25, 0.25, 0.25),
		vec3.fromValues(0.25, 0.25, 0.25)));

	tracer.light(new Light(
		vec3.fromValues(-20.0, 0.0, 20.0),
		vec3.fromValues(0.25, 0.25, 0.25),
		vec3.fromValues(0.25, 0.25, 0.25),
		vec3.fromValues(0.25, 0.25, 0.25)));

	// tracer.light(new Light(
	// 	vec3.fromValues(10.0, 10.0, 10.0),
	// 	vec3.fromValues(0.0, 0.0, 0.0),
	// 	vec3.fromValues(0.75, 0.75, 0.75),
	// 	vec3.fromValues(0.75, 0.75, 0.75)));

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
		AntiAliasing: false,
		Detail: 0,
		Snap: function() {
			flag = true;
		}
	};
	var gui = new dat.GUI();
	gui.add(panel, 'AntiAliasing');
	gui.add(panel, 'Detail', -8, 0).step(1);
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
			tracer.snap(panel.AntiAliasing, panel.Detail);
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