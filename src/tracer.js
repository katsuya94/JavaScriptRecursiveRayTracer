/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

var X = vec3.fromValues(1.0, 0.0, 0.0);
var _X = vec3.fromValues(-1.0, 0.0, 0.0);
var Y = vec3.fromValues(0.0, 1.0, 0.0);
var _Y = vec3.fromValues(0.0, -1.0, 0.0);
var Z = vec3.fromValues(0.0, 0.0, 1.0);
var _Z = vec3.fromValues(0.0, 0.0, -1.0);

function Light(position, ambient, diffuse, specular) {
	this.o = position;
	this.a = ambient;
	this.d = diffuse;
	this.s = specular;
}

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

var _PEWTER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.113725, 0.058824, 0.105882),
	vec3.fromValues(0.521569, 0.333333, 0.333333),
	vec3.fromValues(0.541176, 0.470588, 0.427451),
	9.84615);

var BLACK_PLASTIC = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.01, 0.01, 0.01),
	vec3.fromValues(0.5, 0.5, 0.5),
	4.0);

var WHITE_PLASTIC = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.55, 0.55, 0.55),
	vec3.fromValues(0.7, 0.7, 0.7),
	4.0);

var SILVER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.19225, 0.19225, 0.19225),
	vec3.fromValues(0.50754, 0.50754, 0.50754),
	vec3.fromValues(0.508273, 0.508273, 0.508273),
	0.4);

function Hit(ray, origin, normal, material) {
	this.d = vec3.create();
	vec3.sub(this.d, ray.p, origin);
	this.o = origin;
	this.n = normal;
	this.i = vec3.clone(ray.u);
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
	this.lights = [];
}

Tracer.prototype.register = function(entity) {
	this.entities.push(entity);
}

Tracer.prototype.light = function(light) {
	this.lights.push(light);
}

Tracer.prototype.propagate = function(pixel, hit, level) {
	var shadow = vec3.create();
	var reflection = vec3.create();

	var ambient = vec3.create();
	var diffuse = vec3.create();
	var specular = vec3.create();

	vec3.copy(reflection, hit.i);
	vec3.scaleAndAdd(reflection, reflection, hit.n, -2 * vec3.dot(hit.n, hit.i));

	var h = null;

	if (level > 0) {
		h = this.trace(new Ray(vec3.clone(hit.o), vec3.clone(reflection)), hit.id);

		if (h) {
			this.propagate(specular, h, level - 1);
		}
	}

	for (var i = 0; i < this.lights.length; i++) {
		var l = this.lights[i];

		vec3.add(ambient, ambient, l.a);

		vec3.sub(shadow, l.o, hit.o);
		var d = vec3.len(shadow);
		vec3.normalize(shadow, shadow);

		if (!this.blocks(new Ray(vec3.clone(hit.o), vec3.clone(shadow)), vec3.len(shadow), hit.id)) {
			vec3.scaleAndAdd(diffuse, diffuse, l.d, Math.max(0, vec3.dot(hit.n, shadow)));
		}

		vec3.scaleAndAdd(specular, specular, l.s, Math.pow(Math.max(0, vec3.dot(reflection, shadow)), hit.mat.alpha));
	}

	vec3.mul(ambient, hit.mat.a, ambient);
	vec3.mul(diffuse, hit.mat.d, diffuse);
	vec3.mul(specular, hit.mat.s, specular);

	vec3.add(pixel, pixel, ambient);
	vec3.add(pixel, pixel, diffuse);
	vec3.add(pixel, pixel, specular);
};

Tracer.prototype.intersect = function(ray, entity) {
	var model_ray = new Ray(vec4.fromValues(ray.p[0], ray.p[1], ray.p[2], 1), vec4.fromValues(ray.u[0], ray.u[1], ray.u[2], 0));
	vec4.transformMat4(model_ray.p, model_ray.p, entity.inverse_model);
	vec4.transformMat4(model_ray.u, model_ray.u, entity.inverse_model);

	return entity.hit(model_ray);
};

Tracer.prototype.blocks = function(ray, distance, exclude) {
	for (var i = 0; i < this.entities.length; i++) {
		if (i === exclude) continue;

		var e = this.entities[i];
		var h = this.intersect(ray, e);

		if (h) {
			h.id = i;

			h.d = vec4.fromValues(h.d[0], h.d[1], h.d[2], 0);
			vec4.transformMat4(h.d, h.d, e.model);

			if (vec3.len(h.d) < distance) return true;
		}
	}
	return false;
};

Tracer.prototype.trace = function(ray, exclude) {
	var close = null;

	for (var i = 0; i < this.entities.length; i++) {
		if (i === exclude) continue;

		var e = this.entities[i];
		var h = this.intersect(ray, e);

		if (h) {
			h.id = i;

			h.o = vec4.fromValues(h.o[0], h.o[1], h.o[2], 1);
			vec4.transformMat4(h.o, h.o, e.model);

			h.n = vec4.fromValues(h.n[0], h.n[1], h.n[2], 0);
			vec4.transformMat4(h.n, h.n, e.inverse_transpose_model);
			vec3.normalize(h.n, h.n);

			h.i = vec4.fromValues(h.i[0], h.i[1], h.i[2], 0);
			vec4.transformMat4(h.i, h.i, e.model);

			h.d = vec4.fromValues(h.d[0], h.d[1], h.d[2], 0);
			vec4.transformMat4(h.d, h.d, e.model);

			if (close) {
				if (vec3.len(h.d) < vec3.len(close.d)) {
					close = h;
				}
			} else {
				close = h
			}
		}
	}

	return close;
};

Tracer.prototype.calculate = function(pixel, ray) {
	var h = this.trace(ray);
	if (h) this.propagate(pixel, h, 2);
};

Tracer.prototype.sample = function(pixel, x, y) {
	var p = camera.position;
	var u = vec3.clone(camera.front_r);

	var i = vec3.create();
	vec3.scale(i, camera.right_r, x * T_2 * camera.ar);
	var j = vec3.create();
	vec3.scale(j, camera.up_r, y * T_2);

	vec3.add(u, u, i);
	vec3.add(u, u, j);

	var r = new Ray(p, u);

	this.calculate(pixel, r);
}

Tracer.prototype.rasterize = function(width, height, big_width, big_height, aa) {
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

			if (aa) {
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

Tracer.prototype.snap = function(aa, detail) {
	var width = gl.drawingBufferWidth * Math.pow(2, detail) / 2;
	var height = gl.drawingBufferHeight * Math.pow(2, detail);

	var big_width = Math.pow(2, Math.ceil(Math.baseLog(2, width)));
	var big_height = Math.pow(2, Math.ceil(Math.baseLog(2, height)));

	var image = this.rasterize(width, height, big_width, big_height, aa);

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