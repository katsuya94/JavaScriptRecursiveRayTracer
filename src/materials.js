function Material(emissive, ambient, diffuse, specular, alpha) {
	this.e = emissive;
	this.a = ambient;
	this.d = diffuse;
	this.s = specular;
	this.alpha = alpha;
}

var PEWTER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.105882, 0.058824, 0.113725),
	vec3.fromValues(0.333333, 0.333333, 0.521569),
	vec3.fromValues(0.427451, 0.470588, 0.541176),
	9.84615);

var _PEWTER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.113725, 0.058824, 0.105882),
	vec3.fromValues(0.521569, 0.333333, 0.333333),
	vec3.fromValues(0.541176, 0.470588, 0.427451),
	9.84615);

var BLACK_PLASTIC = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.01, 0.01, 0.01),
	vec3.fromValues(0.5, 0.5, 0.5),
	4.0);

var WHITE_PLASTIC = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.55, 0.55, 0.55),
	vec3.fromValues(0.7, 0.7, 0.7),
	4.0);

var SILVER = new Material(
	vec3.fromValues(0.0, 0.0, 0.0),
	vec3.fromValues(0.19225, 0.19225, 0.19225),
	vec3.fromValues(0.50754, 0.50754, 0.50754),
	vec3.fromValues(0.508273, 0.508273, 0.508273),
	0.4);