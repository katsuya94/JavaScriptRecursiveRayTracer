/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

var NIL = vec3.create();

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

function Hit(ray, origin, normal, material) {
	this.o = origin;
	this.n = normal;
	this.i = ray.u;
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

	var ambient = vec3.create();
	var diffuse = vec3.create();
	var specular = vec3.create();

	var reflection = vec3.clone(hit.i);
	vec3.scaleAndAdd(reflection, reflection, hit.n, -2 * vec3.dot(hit.n, hit.i));

	var h = null;

	if (level > 0) {
		h = this.trace(new Ray(vec3.clone(hit.o), vec3.clone(reflection)), hit.id);

		if (h !== null) {
			this.propagate(specular, h, level - 1);
		}
	}

	for (var i = 0; i < this.lights.length; i++) {
		var l = this.lights[i];

		vec3.add(ambient, ambient, l.a);

		vec3.sub(shadow, l.o, hit.o);
		var d = vec3.len(shadow);
		vec3.normalize(shadow, shadow);

		var lambertian = vec3.dot(hit.n, shadow);

		if (lambertian > 0) {
			if (!this.blocks(new Ray(vec3.clone(hit.o), vec3.clone(shadow)), d, hit.id)) {
				vec3.scaleAndAdd(diffuse, diffuse, l.d, lambertian);
				vec3.scaleAndAdd(specular, specular, l.s, Math.pow(Math.max(0, vec3.dot(reflection, shadow)), hit.mat.alpha));
			}
		}
	}

	vec3.mul(ambient, hit.mat.a, ambient);
	vec3.mul(diffuse, hit.mat.d, diffuse);
	vec3.mul(specular, hit.mat.s, specular);

	vec3.add(pixel, pixel, ambient);
	vec3.add(pixel, pixel, diffuse);
	vec3.add(pixel, pixel, specular);
};

Tracer.prototype.blocks = function(ray, distance, exclude) {
	for (var i = 0; i < this.entities.length; i++) {
		if (i === exclude) continue;

		var e = this.entities[i];
		var m_ray = world_ray_to_model(ray, e);
		var col = e.col(m_ray);

		if (col !== null) {
			var disp = vec4.fromValues(col.t * ray.u[0], col.t * ray.u[1], col.t * ray.u[2], 0);
			vec4.transformMat4(disp, disp, e.inverse_transpose_model);
			var dist = vec3.len(disp);
			if (dist < distance)
				return true;
		}
	}
	return false;
};

Tracer.prototype.trace = function(ray, exclude) {
	var dist = null;
	var disp = null;
	var m_ray = null;
	var col = null;
	var id = null;

	for (var i = 0; i < this.entities.length; i++) {
		if (i === exclude) continue;

		var _e = this.entities[i];
		var _m_ray = world_ray_to_model(ray, _e);
		var _col = _e.col(_m_ray);

		if (_col !== null ) {
			var _disp = vec4.fromValues(_col.t * _m_ray.u[0], _col.t * _m_ray.u[1], _col.t * _m_ray.u[2], 0);
			vec4.transformMat4(_disp, _disp, _e.model);
			var _dist = vec3.len(_disp);

			if (dist === null || _dist < dist) {
				dist = _dist;
				disp = _disp;
				m_ray = _m_ray;
				col = _col;
				id = i;
			} 
		}
	}

	if (id !== null) {
		var e = this.entities[id];

		var h = e.hit(m_ray, col);

		h.o = vec4.fromValues(h.o[0], h.o[1], h.o[2], 1);
		vec4.transformMat4(h.o, h.o, e.model);

		h.n = vec4.fromValues(h.n[0], h.n[1], h.n[2], 0);
		vec4.transformMat4(h.n, h.n, e.inverse_transpose_model);
		vec3.normalize(h.n, h.n);

		h.i = vec4.fromValues(h.i[0], h.i[1], h.i[2], 0);
		vec4.transformMat4(h.i, h.i, e.model);

		h.id = id;

		return h;
	}

	return null;
};

Tracer.prototype.calculate = function(pixel, ray) {
	var h = this.trace(ray);
	if (h) this.propagate(pixel, h, this.recursion);
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
	aa = parseInt(aa);
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

			switch (aa) {
			case 0:
				this.sample(pixel, x, y, camera);
				break;
			case 1:
				this.sample(pixel, x + Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);
				this.sample(pixel, x - Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);

				pixel[0] /= 4;
				pixel[1] /= 4;
				pixel[2] /= 4;
				break;
			case 2:
				var cx, cy;

				cx = x + (0.5 / width);
				cy = y + (0.5 / width);

				this.sample(pixel, cx + Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx - Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);

				cx = x + (0.5 / width);
				cy = y - (0.5 / width);

				this.sample(pixel, cx + Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx - Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);

				cx = x - (0.5 / width);
				cy = y + (0.5 / width);

				this.sample(pixel, cx + Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx - Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);

				cx = x - (0.5 / width);
				cy = y - (0.5 / width);

				this.sample(pixel, cx + Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx - Math.random() * (0.5 / width), cy + Math.random() * (0.5 / height), camera);
				this.sample(pixel, cx + Math.random() * (0.5 / width), cy - Math.random() * (0.5 / height), camera);

				pixel[0] /= 16;
				pixel[1] /= 16;
				pixel[2] /= 16;
				break;
			}
			image[offset + 0] = Math.min(pixel[0] * 256, 255);
			image[offset + 1] = Math.min(pixel[1] * 256, 255);
			image[offset + 2] = Math.min(pixel[2] * 256, 255);
		}
	}
	return image;
};

Tracer.prototype.snap = function(aa, detail, recursion) {
	this.recursion = recursion;

	var width = gl.drawingBufferWidth * Math.pow(2, detail) / 2;
	var height = gl.drawingBufferHeight * Math.pow(2, detail);

	var big_width = Math.pow(2, Math.ceil(Math.baseLog(2, width)));
	var big_height = Math.pow(2, Math.ceil(Math.baseLog(2, height)));

	var before = Date.now();
	var image = this.rasterize(width, height, big_width, big_height, aa);
	console.log(Date.now() - before + 'ms Elapsed');

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

	return Array.prototype.slice.call(camera.rotate).concat(Array.prototype.slice.call(camera.position)).toString();
};

Tracer.prototype.draw = function() {
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};