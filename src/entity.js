/* jshint strict: false */
/* exported Entity */

function Entity(draw, model, col, hit, material) {
	this.draw = draw;
	this.model = model;

	this.inverse_model = mat4.create();
	mat4.invert(this.inverse_model, this.model);

	this.inverse_transpose_model = mat4.create();
	mat4.transpose(this.inverse_transpose_model, this.inverse_model);

	this.transpose_model = mat4.create();
	mat4.transpose(this.transpose_model, this.model);

	this.col = col;
	this.hit = hit;

	this.material = material;
}