/* jshint strict: false */
/* global vec3 */
/* exported Material, PEWTER, BLACK_PLASTIC, WHITE_PLASTIC, RED_PLASTIC, GREEN_PLASTIC, BLUE_PLASTIC, METAL, LIGHT_METAL */

function Material(ambient, diffuse, specular, alpha) {
	this.a = ambient;
	this.d = diffuse;
	this.s = specular;
	this.alpha = alpha;
}

var PEWTER = new Material(
	vec3.fromValues(0.105882, 0.058824, 0.113725),
	vec3.fromValues(0.333333, 0.333333, 0.521569),
	vec3.fromValues(0.427451, 0.470588, 0.541176),
	9.84615);

var BLACK_PLASTIC = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.5, 0.5, 0.5),
	4.0);

var WHITE_PLASTIC = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.55, 0.55, 0.55),
	vec3.fromValues(0.7, 0.7, 0.7),
	4.0);

var RED_PLASTIC = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.55, 0.0, 0.0),
	vec3.fromValues(0.7, 0.0, 0.0),
	4.0);

var GREEN_PLASTIC = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.0, 0.55, 0.0),
	vec3.fromValues(0.0, 0.7, 0.0),
	4.0);

var BLUE_PLASTIC = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.0, 0.0, 0.55),
	vec3.fromValues(0.7, 0.0, 0.7),
	4.0);

var METAL = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(1.0, 1.0, 1.0),
	2.5);

var LIGHT_METAL = new Material(
	vec3.fromValues(0.05, 0.05, 0.05),
	vec3.fromValues(0.25, 0.75, 0.25),
	vec3.fromValues(0.25, 0.75, 0.25),
	2.5);