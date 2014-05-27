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
	mat4.perspective(projection, Math.PI / 3, gl.drawingBufferWidth / gl.drawingBufferHeight / 2, 1.0, 100.0);
}

Math.baseLog = function(x, y) {
    return Math.log(y) / Math.log(x);
}