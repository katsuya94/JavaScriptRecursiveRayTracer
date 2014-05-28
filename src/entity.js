/* jshint strict: false */
/* exported Entity */

function Entity(vertices, indices, model, hit) {
	this.vertices = vertices;
	this.indices = indices;
	this.model = model;
	this.hit = hit;
}