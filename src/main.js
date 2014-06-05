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
	var tracer = new Tracer(program_image);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// Set up Camera
	camera = init_camera();

	// Geometry
	scene_b(buffers, tracer);
	buffers.populate();

	var flag = true;

	// dat.GUI
	var panel = {
		LoadSceneA: function() {
			buffers.draws = [];
			buffers.vertices = [];
			buffers.indices = [];
			tracer.entities = [];
			tracer.lights = [];
			scene_a(buffers, tracer);
			buffers.populate();
		},
		LoadSceneB: function() {
			buffers.draws = [];
			buffers.vertices = [];
			buffers.indices = [];
			tracer.entities = [];
			tracer.lights = [];
			scene_b(buffers, tracer);
			buffers.populate();
		},

		AntiAliasing: 0,
		Detail: -1,
		Recursion: 0,

		Code: '',
		UseCode: function() {
			var array = this.Code.split(',').map(Number.parseFloat);
			quat.set(camera.rotate, array[0], array[1], array[2], array[3]);
			vec3.set(camera.position, array[4], array[5], array[6]);
		},

		ID: '',
		X: '',
		Y: '',
		Z: '',
		On: true,
		Get: function() {
			var l = tracer.lights[parseInt(panel.ID)];
			if (l) {
				panel.X = l.o[0].toString();
				panel.Y = l.o[1].toString();
				panel.Z = l.o[2].toString();
				panel.On = l.on;
			}
		},
		Update: function() {
			var l = tracer.lights[parseInt(panel.ID)];
			if (l) {
				l.o[0] = parseFloat(panel.X);
				l.o[1] = parseFloat(panel.Y);
				l.o[2] = parseFloat(panel.Z);
				l.on = panel.On;
			}
		},

		Snap: function() {
			flag = true;
		},
	};
	var gui = new dat.GUI();
	var scenes = gui.addFolder('Scenes');
	scenes.add(panel, 'LoadSceneA');
	scenes.add(panel, 'LoadSceneB');
	var config = gui.addFolder('Config');
	config.add(panel, 'AntiAliasing', { None: 0, Jitter4X: 1, Jitter16X: 2});
	config.add(panel, 'Detail', -8, 0).step(1);
	config.add(panel, 'Recursion', 0, 5).step(1);
	var cam = gui.addFolder('Camera')
	cam.add(panel, 'Code').listen();
	cam.add(panel, 'UseCode');
	var lighting = gui.addFolder('Lighting');
	lighting.add(panel, 'ID');
	lighting.add(panel, 'X').listen();
	lighting.add(panel, 'Y').listen();
	lighting.add(panel, 'Z').listen();
	lighting.add(panel, 'On').listen();
	lighting.add(panel, 'Get');
	lighting.add(panel, 'Update');
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
		gl.vertexAttribPointer(buffers.a_position, 3, gl.FLOAT, false, 3 * ASIZE, 0 * ASIZE);

		camera.update(dt);
		buffers.draw(camera);

		if (flag) {
			flag = false;
			panel.Code = tracer.snap(panel.AntiAliasing, panel.Detail, panel.Recursion);
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