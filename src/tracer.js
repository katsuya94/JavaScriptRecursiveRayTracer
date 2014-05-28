/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

var X = vec4.fromValues(1.0, 0.0, 0.0, 0.0);
var _X = vec4.fromValues(-1.0, 0.0, 0.0, 0.0);
var Y = vec4.fromValues(0.0, 1.0, 0.0, 0.0);
var _Y = vec4.fromValues(0.0, -1.0, 0.0, 0.0);
var Z = vec4.fromValues(0.0, 0.0, 1.0, 0.0);
var _Z = vec4.fromValues(0.0, 0.0, -1.0, 0.0);

function Material(emissive, ambient, diffuse, specular, alpha) {
	this.e = emissive;
	this.a = ambient;
	this.d = diffuse;
	this.s = specular;
	this.alpha = alpha;
}

var PEWTER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.105882, 0.058824, 0.113725),
	vec3.fromValues(0.333333, 0.333333, 0.521569),
	vec3.fromValues(0.427451, 0.470588, 0.541176),
	9.84615);

function Hit(ray, origin, normal, incident, material) {
	var x = origin[0] - ray.p[0];
	var y = origin[1] - ray.p[1];
	var z = origin[2] - ray.p[2];
	this.distance = Math.sqrt(x * x + y * y + z * z);
	this.o = origin;
	this.n = normal;
	this.i = incident;
	this.mat = material;
}

function Ray(origin, direction) {
	this.p = origin;
	this.u = direction;
}

function Tracer(program) {
	this.a_rectangle = gl.getAttribLocation(program, 'a_rectangle');
	this.a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

	this.u_image = gl.getUniformLocation(program, 'u_image');

	gl.uniform1i(this.u_image, 0);
	
	this.buffer_rectangle = gl.createBuffer();

	gl.enableVertexAttribArray(this.a_rectangle);

	this.entities = [];
}

Tracer.prototype.register = function(entity) {
	this.entities.push(entity.hit);
}

var propagate_temp = vec3.create();

Tracer.prototype.propagate = function(pixel, hit) {
	vec3.add(pixel, pixel, hit.mat.d);
	vec3.add(pixel, pixel, hit.mat.a);
	if (Math.floor(hit.o[0] / hit.o[3]) % 2 === 0) pixel[0] += 0.5;
	if (Math.floor(hit.o[1] / hit.o[3]) % 2 === 0) pixel[1] += 0.5;
}

Tracer.prototype.trace = function(pixel, ray) {
	var close = null;
	for (var i = 0; i < this.entities.length; i++) {
		var h = this.entities[i](ray);
		if (h) {
			if (close) {
				if (h.distance < close.distance) {
					close = h;
				}
			} else {
				close = h
			}
		}
	}

	if (close) {
		this.propagate(pixel, close);
	}
}

Tracer.prototype.sample = function(pixel, x, y, camera) {
	var p = vec4.fromValues(x, y, 1.0, 1.0);
	var u = vec4.fromValues(0.0, 0.0, -1.0, 0.0);

	vec4.transformMat4(p, p, camera._vp);
	vec4.transformMat4(u, u, camera._vp);

	vec4.normalize(u, u);

	var r = new Ray(p, u);

	this.trace(pixel, r);
}

Tracer.prototype.rasterize = function(camera, width, height, big_width, big_height) {
	var pixel = vec3.create();
	var image = new Uint8Array(big_width * big_height * 3);
	for (var j = 0; j < height; j++) {
		for (var i = 0; i < width; i++) {
			pixel[0] = 0.0;
			pixel[1] = 0.0;
			pixel[2] = 0.0;

			var offset = i * 3 + j * big_width * 3;

			var x = 2 * i / width - 1 + 1 / width;
			var y = 2 * j / height - 1 + 1 / height;

			if (true) {
				this.sample(pixel, x + Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);
				this.sample(pixel, x - Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);

				pixel[0] /= 4;
				pixel[1] /= 4;
				pixel[2] /= 4;

				image[offset + 0] = Math.min(pixel[0] * 256, 255);
				image[offset + 1] = Math.min(pixel[1] * 256, 255);
				image[offset + 2] = Math.min(pixel[2] * 256, 255);
			} else {
				this.sample(pixel, x, y, camera);

				image[offset + 0] = Math.min(pixel[0] * 256, 255);
				image[offset + 1] = Math.min(pixel[1] * 256, 255);
				image[offset + 2] = Math.min(pixel[2] * 256, 255);
			}
		}
	}
	return image;
};

Tracer.prototype.snap = function(camera) {
	var width = gl.drawingBufferWidth / 2 / 4;
	var height = gl.drawingBufferHeight / 4;

	mat4.invert(camera._vp, camera.vp);

	var big_width = Math.pow(2, Math.ceil(Math.baseLog(2, width)));
	var big_height = Math.pow(2, Math.ceil(Math.baseLog(2, height)));

	var image = this.rasterize(camera, width, height, big_width, big_height);

	var tex_image = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex_image);

	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGB,
		big_width,
		big_height,
		0,
		gl.RGB,
		gl.UNSIGNED_BYTE,
		image
	);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_rectangle);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0, 0.0, 0.0,
		-1.0, 1.0, 0.0, height / big_height,
		1.0, -1.0, width / big_width, 0.0,
		1.0, 1.0, width / big_width, height / big_height
	]), gl.STATIC_DRAW);
};

Tracer.prototype.draw = function() {
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};