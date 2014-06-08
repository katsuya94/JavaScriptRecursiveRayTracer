/* jshint strict: false */
/* exported Light */

function Light(position, ambient, diffuse, specular) {
	this.o = position;
	this.a = ambient;
	this.d = diffuse;
	this.s = specular;
	this.on = true;
}