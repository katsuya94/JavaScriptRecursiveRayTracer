/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

function trace(width, height, big_width, big_height) {
	var image = new Uint8Array(big_width * big_height * 3);
	for (var j = 0; j < height; j++) {
		for (var i = 0; i < width; i++) {
			image[i * 3 + 0 + j * big_width * 3] = Math.floor(Math.random() * 256);
			image[i * 3 + 1 + j * big_width * 3] = Math.floor(Math.random() * 256);
			image[i * 3 + 2 + j * big_width * 3] = Math.floor(Math.random() * 256);
		}
	}
	return image;
};

function Tracer(program) {
	this.a_rectangle = gl.getAttribLocation(program, 'a_rectangle');
	this.a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

	this.u_image = gl.getUniformLocation(program, 'u_image');

	gl.uniform1i(this.u_image, 0);
	
	this.buffer_rectangle = gl.createBuffer();

	gl.enableVertexAttribArray(this.a_rectangle);
}

Tracer.prototype.snap = function() {
	var width = gl.drawingBufferWidth / 2;
	var height = gl.drawingBufferHeight;

	var big_width = Math.pow(2, Math.ceil(Math.baseLog(2, width)));
	var big_height = Math.pow(2, Math.ceil(Math.baseLog(2, height)));

	var image = trace(width, height, big_width, big_height);

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