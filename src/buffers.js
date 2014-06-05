/* jshint strict: false */
/* global this, gl */
/* global mat4 */
/* global ASIZE, ESIZE, VSIZE */
/* exported init_buffers */

function Buffers(program) {
	this.a_position = gl.getAttribLocation(program, 'a_position');

	this.u_mvp = gl.getUniformLocation(program, 'u_mvp');

	this.draws = [];

	this.vertices = [];
	this.indices = [];

	this.mvp = mat4.create();
}

Buffers.prototype.arrayDraw = function(ent, md) {
	var offset = this.vertices.length / VSIZE;
	var count = ent.vertices.length / VSIZE;
	var mode = gl[md.toUpperCase()];

	this.vertices = this.vertices.concat(ent.vertices);

	var thisself = this;

	this.draws.push(function(vp) {
		mat4.multiply(thisself.mvp, ent.model, vp);
		gl.uniformMatrix4fv(thisself.u_mvp, false, thisself.mvp);
		gl.drawArrays(mode, offset, count);
	});
};

Buffers.prototype.elementDraw = function(ent, md) {
	var offset = this.indices.length;
	var count = ent.indices.length;
	var mode = gl[md.toUpperCase()];

	var v_offset = this.vertices.length / VSIZE;

	this.vertices = this.vertices.concat(ent.vertices);
	
	for (var i = 0; i < ent.indices.length; i++) {
		this.indices.push(ent.indices[i] + v_offset);
	}

	var thisself = this;

	this.draws.push(function(vp) {
		mat4.multiply(thisself.mvp, ent.model, vp);
		gl.uniformMatrix4fv(thisself.u_mvp, false, thisself.mvp);
		gl.drawElements(mode, count, gl.UNSIGNED_SHORT, offset * ESIZE);
	});
};

Buffers.prototype.draw = function(camera) {
	for (var i = 0; i < this.draws.length; i++) {
		this.draws[i](camera.vp);
	}
};

Buffers.prototype.populate = function() {
	this.buffer_vertex = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(this.a_position);

	var indexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
};