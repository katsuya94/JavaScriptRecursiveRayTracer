/* jshint strict: false */
/* global gl, camera */
/* global mat4 */
/* global ESIZE, VSIZE */
/* exported init_buffers */

function Buffers(program) {
	this.buffer_vertex = gl.createBuffer();
	
	this.a_position = gl.getAttribLocation(program, 'a_position');
	this.a_normal = gl.getAttribLocation(program, 'a_normal');

	this.u_mvp = gl.getUniformLocation(program, 'u_mvp');
	this.u_model = gl.getUniformLocation(program, 'u_model');
	this.u_inverse_transpose_model = gl.getUniformLocation(program, 'u_inverse_transpose_model');

	this.u_camera_position = gl.getUniformLocation(program, 'u_camera_position');

	this.u_lights = [
		{
			o: gl.getUniformLocation(program, 'u_a_position'),
			a: gl.getUniformLocation(program, 'u_a_ambient'),
			d: gl.getUniformLocation(program, 'u_a_diffuse'),
			s: gl.getUniformLocation(program, 'u_a_specular')
		},
		{
			o: gl.getUniformLocation(program, 'u_b_position'),
			a: gl.getUniformLocation(program, 'u_b_ambient'),
			d: gl.getUniformLocation(program, 'u_b_diffuse'),
			s: gl.getUniformLocation(program, 'u_b_specular')
		},
		{
			o: gl.getUniformLocation(program, 'u_c_position'),
			a: gl.getUniformLocation(program, 'u_c_ambient'),
			d: gl.getUniformLocation(program, 'u_c_diffuse'),
			s: gl.getUniformLocation(program, 'u_c_specular')
		},
		{
			o: gl.getUniformLocation(program, 'u_d_position'),
			a: gl.getUniformLocation(program, 'u_d_ambient'),
			d: gl.getUniformLocation(program, 'u_d_diffuse'),
			s: gl.getUniformLocation(program, 'u_d_specular')
		}
	];

	this.u_material = {
		a: gl.getUniformLocation(program, 'u_ambient'),
		d: gl.getUniformLocation(program, 'u_diffuse'),
		s: gl.getUniformLocation(program, 'u_specular'),
		alpha: gl.getUniformLocation(program, 'u_alpha')
	};

	this.u_state = gl.getUniformLocation(program, 'u_state');

	this.u_mode = gl.getUniformLocation(program, 'u_mode');

	this.entities = [];

	this.lights = [];

	this.vertices = [];
	this.indices = [];

	this.mvp = mat4.create();
}

Buffers.prototype.clear = function() {
	this.entities = [];
	this.lights = [];
	this.vertices = [];
	this.indices = [];
};

Buffers.prototype.register = function(entity) {
	this.entities.push(entity);
};

Buffers.prototype.light = function(light) {
	this.lights.push(light);
};

Buffers.prototype.updateLights = function() {
	var state = 0;
	for (var i = 0; i < this.u_lights.length && i < this.lights.length; i++) {
		gl.uniform3fv(this.u_lights[i].o, this.lights[i].o);
		gl.uniform3fv(this.u_lights[i].a, this.lights[i].a);
		gl.uniform3fv(this.u_lights[i].d, this.lights[i].d);
		gl.uniform3fv(this.u_lights[i].s, this.lights[i].s);
		if(this.lights[i].on) state = state | (1 << i);
	}
	gl.uniform1i(this.u_state, state);
};

Buffers.prototype.arrayDraw = function(vertices, md) {
	var offset = this.vertices.length / VSIZE;
	var count = vertices.length / VSIZE;
	var mode = gl[md.toUpperCase()];

	this.vertices = this.vertices.concat(vertices);

	return {
		elements: false,
		mode: mode,
		offset: offset,
		count: count,
	};
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
	};
};

Buffers.prototype.draw = function() {
	gl.uniform3fv(this.u_camera_position, camera.position);
	for (var i = 0; i < this.entities.length; i++) {
		var e = this.entities[i];
		mat4.multiply(this.mvp, camera.vp, e.model);
		gl.uniformMatrix4fv(this.u_mvp, false, this.mvp);
		gl.uniformMatrix4fv(this.u_model, false, e.model);
		gl.uniformMatrix4fv(this.u_inverse_transpose_model, false, e.inverse_transpose_model);
		gl.uniform3fv(this.u_material.a, e.material.a);
		gl.uniform3fv(this.u_material.d, e.material.d);
		gl.uniform3fv(this.u_material.s, e.material.s);
		gl.uniform1f(this.u_material.alpha, e.material.alpha);
		gl.uniform1i(this.u_mode, e.mode);
		if (e.draw.elements) {
			gl.drawElements(e.draw.mode, e.draw.count, gl.UNSIGNED_SHORT, e.draw.offset * ESIZE);
		} else {
			gl.drawArrays(e.draw.mode, e.draw.offset, e.draw.count);
		}
	}
};

Buffers.prototype.populate = function() {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer_vertex);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(this.a_position);
	gl.enableVertexAttribArray(this.a_normal);

	var indexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
};