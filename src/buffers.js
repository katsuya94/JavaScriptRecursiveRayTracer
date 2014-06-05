/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

function Buffers(program) {
	this.a_position = gl.getAttribLocation(program, 'a_position');
	this.a_normal = gl.getAttribLocation(program, 'a_normal');

	this.u_mvp = gl.getUniformLocation(program, 'u_mvp');

	this.entities = [];

	this.vertices = [];
	this.indices = [];

	this.mvp = mat4.create();
}

Buffers.prototype.register = function(entity) {
	this.entities.push(entity);
};

Buffers.prototype.arrayDraw = function(vertices, md) {
	var offset = this.vertices.length / VSIZE;
	var count = vertices.length / VSIZE;
	var mode = gl[md.toUpperCase()];

	this.vertices = this.vertices.concat(vertices);

	var thisself = this;

	return {
		elements: false,
		mode: mode,
		offset: offset,
		count: count,
	}
};

Buffers.prototype.elementDraw = function(vertices, indices, md) {
	var offset = this.indices.length;
	var count = indices.length;
	var mode = gl[md.toUpperCase()];

	var v_offset = this.vertices.length / VSIZE;

	this.vertices = this.vertices.concat(vertices);
	
	for (var i = 0; i < indices.length; i++) {
		this.indices.push(indices[i] + v_offset);
	}

	return {
		elements: true,
		mode: mode,
		offset: offset,
		count: count,
	}
};

Buffers.prototype.draw = function(camera) {
	for (var i = 0; i < this.entities.length; i++) {
		var e = this.entities[i];
		mat4.multiply(this.mvp, camera.vp, e.model);
		gl.uniformMatrix4fv(this.u_mvp, false, this.mvp);
		if (e.draw.elements)
			gl.drawElements(e.draw.mode, e.draw.count, gl.UNSIGNED_SHORT, e.draw.offset * ESIZE);
		else
			gl.drawArrays(e.draw.mode, e.draw.offset, e.draw.count);
	}
};

Buffers.prototype.populate = function() {
	this.buffer_vertex = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(this.a_position);
	gl.enableVertexAttribArray(this.a_normal);

	var indexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
};