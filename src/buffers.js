function init_buffers() {
	gl.bindBuffer(gl.ARRAY_BUFFER, system.buffer_static);
	gl.vertexAttribPointer(program.a_position, 3, gl.FLOAT, false, 6 * FSIZE, 0 * FSIZE);
	gl.vertexAttribPointer(program.a_vertcolor, 3, gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
}