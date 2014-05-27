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

xmax = 0, xmin = 0, ymax = 0, ymin = 0;

function Ray(origin, direction) {
	this.o = origin;
	this.d = direction;
}

function Tracer(program) {
	this.a_rectangle = gl.getAttribLocation(program, 'a_rectangle');
	this.a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

	this.u_image = gl.getUniformLocation(program, 'u_image');

	gl.uniform1i(this.u_image, 0);
	
	this.buffer_rectangle = gl.createBuffer();

	gl.enableVertexAttribArray(this.a_rectangle);
}

Tracer.prototype.trace = function(pixel, ray, camera) {
	var t = ray.o[2] / vec4.dot(ray.d, _Z);

	if (t < 0) return;

	var hit = vec4.create();
	vec4.scaleAndAdd(hit, ray.o, ray.d, t);

	var id = ((Math.floor(hit[0] / hit[3]) + Math.floor(hit[1] / hit[3])) % 3 + 3) % 3;
	if (id === 0) pixel[0] += 255;
	if (id === 1) pixel[1] += 255;
	if (id === 2) pixel[2] += 255;
}

Tracer.prototype.sample = function(pixel, x, y, camera) {
	var r = new Ray(
		vec4.fromValues(x, y, 1.0, 1.0),
		vec4.fromValues(0.0, 0.0, -1.0, 0.0));

	vec4.transformMat4(r.o, r.o, camera._vp);
	vec4.transformMat4(r.d, r.d, camera._vp);
	vec4.normalize(r.d, r.d);

	this.trace(pixel, r, camera);
}

Tracer.prototype.rasterize = function(camera, width, height, big_width, big_height) {
	var pixel = new Uint16Array(3);
	var image = new Uint8Array(big_width * big_height * 3);
	for (var j = 0; j < height; j++) {
		for (var i = 0; i < width; i++) {
			pixel[0] = 0;
			pixel[1] = 0;
			pixel[2] = 0;

			var offset = i * 3 + j * big_width * 3;

			var x = 2 * i / width - 1 + 1 / width;
			var y = 2 * j / height - 1 + 1 / height;

			if (true) {
				this.sample(pixel, x + Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);
				this.sample(pixel, x - Math.random() * (1 / width), y + Math.random() * (1 / height), camera);
				this.sample(pixel, x + Math.random() * (1 / width), y - Math.random() * (1 / height), camera);

				image[offset + 0] = pixel[0] / 4;
				image[offset + 1] = pixel[1] / 4;
				image[offset + 2] = pixel[2] / 4;
			} else {
				this.sample(pixel, x, y, camera);

				image[offset + 0] = pixel[0];
				image[offset + 1] = pixel[1];
				image[offset + 2] = pixel[2];
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