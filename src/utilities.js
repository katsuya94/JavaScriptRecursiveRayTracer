/* jshint strict: false */
/* global gl: true, canvas: true, mat4, projection */
/* exported createShader, createProgram, resize */

function createShader(source, type) {

	var shader = gl.createShader( type );

	gl.shaderSource( shader, source );
	gl.compileShader( shader );

	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) )
		throw gl.getShaderInfoLog( shader );

	return shader;
}

function createProgram(vertexSource, fragmentSource) {

	var vs = createShader( vertexSource, gl.VERTEX_SHADER );
	var fs = createShader( fragmentSource, gl.FRAGMENT_SHADER );

	var program = gl.createProgram();

	gl.attachShader( program, vs );
	gl.attachShader( program, fs );
	gl.linkProgram( program );

	if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
		throw gl.getProgramInfoLog( program );

	return program;
}

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	camera.resize(gl.drawingBufferWidth / gl.drawingBufferHeight / 2);
}

Math.baseLog = function(x, y) {
    return Math.log(y) / Math.log(x);
}

function param_ray(ray, t) {
	return vec3.fromValues(ray.p[0] + ray.u[0] * t, ray.p[1] + ray.u[1] * t, ray.p[2] + ray.u[2] * t)
}
function world_ray_to_model(ray, entity) {
	var m = entity.inverse_model;
	return new Ray(
		vec3.fromValues(
			ray.p[0] * m[0] + ray.p[1] * m[4] + ray.p[2] * m[8] + m[12],
			ray.p[0] * m[1] + ray.p[1] * m[5] + ray.p[2] * m[9] + m[13],
			ray.p[0] * m[2] + ray.p[1] * m[6] + ray.p[2] * m[10] + m[14]),
		vec3.fromValues(
			ray.u[0] * m[0] + ray.u[1] * m[4] + ray.u[2] * m[8],
			ray.u[0] * m[1] + ray.u[1] * m[5] + ray.u[2] * m[9],
			ray.u[0] * m[2] + ray.u[1] * m[6] + ray.u[2] * m[10]));
}