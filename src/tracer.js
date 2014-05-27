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

Tracer.prototype.trace = function(image, offset, camera, ray) {
	var t = ray.o[2] / vec4.dot(ray.d, _Z);
	var hit = vec4.create();
	vec4.scaleAndAdd(hit, ray.o, ray.d, t);

	image[offset] = ((Math.floor(hit[0]) + Math.floor(hit[1])) % 2) ? 255 : 0;
	image[offset + 1] = Math.max(0, (1 - Math.sqrt(hit[0] * hit[0] + hit[1] * hit[1]))) * 255;
}

Tracer.prototype.rasterize = function(camera, width, height, big_width, big_height) {
	var image = new Uint8Array(big_width * big_height * 3);
	for (var j = 0; j < height; j++) {
		for (var i = 0; i < width; i++) {
			var r = new Ray(
				vec4.fromValues(
					2 * i / width - 1 + 1 / width,
					2 * j / height - 1 + 1 / height,
					-1.0,
					1.0),
				vec4.fromValues(0.0, 0.0, 1.0, 0.0));

			vec4.transformMat4(r.o, r.o, camera._vp);
			vec4.transformMat4(r.d, r.d, camera._vp);
			vec4.normalize(r.d, r.d);

			this.trace(image, i * 3 + j * big_width * 3, camera, r);
		}
	}
	return image;
};

Tracer.prototype.snap = function(camera) {
	var width = gl.drawingBufferWidth / 2;
	var height = gl.drawingBufferHeight;

	mat4.invert(camera._vp, camera.vp)

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