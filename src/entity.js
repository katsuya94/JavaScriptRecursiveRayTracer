/* jshint strict: false */
/* exported Entity */

function Entity(vertices, indices, model, collision) {
	this.vertices = vertices;
	this.indices = indices;
	this.model = model;
	this.collision = collision;
}