/* jshint strict: false */
/* global mat4, vec3 */
/* exported init_camera */

var projection;

function init_camera() {
	camera = {};
	camera.up = vec3.fromValues(0, 0, 1);
	camera.front = vec3.fromValues(0, 1, 0);
	camera.right = vec3.fromValues(1, 0, 0);

	camera.up_r = vec3.create();
	camera.front_r = vec3.create();
	camera.right_r = vec3.create();

	camera.center = vec3.create();

	camera.rotate = quat.create();

	camera.position = vec3.fromValues(10, 10, 20);

	camera.view = mat4.create();
	camera.projection = mat4.create();
	camera.vp = mat4.create();

	camera.dirpad = [false, false, false, false];
	camera.wasd = [false, false, false, false];
	camera.qe = [false, false];

	window.onkeydown = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		switch (key) {
		case 37:
			camera.dirpad[0] = true;
			break;
		case 38:
			camera.dirpad[1] = true;
			break;
		case 39:
			camera.dirpad[2] = true;
			break;
		case 40:
			camera.dirpad[3] = true;
			break;
		case 65:
			camera.wasd[0] = true;
			break;
		case 87:
			camera.wasd[1] = true;
			break;
		case 68:
			camera.wasd[2] = true;
			break;
		case 83:
			camera.wasd[3] = true;
			break;
		case 81:
			camera.qe[0] = true;
			break;
		case 69:
			camera.qe[1] = true;
			break;
		case 112:
			document.getElementById('help').style.display = 'block';
			break;
		}
	};

	window.onkeyup = function(e) {
		var key = e.keyCode ? e.keyCode : e.which;
		switch(key) {
		case 37:
			camera.dirpad[0] = false;
			break;
		case 38:
			camera.dirpad[1] = false;
			break;
		case 39:
			camera.dirpad[2] = false;
			break;
		case 40:
			camera.dirpad[3] = false;
			break;
		case 65:
			camera.wasd[0] = false;
			break;
		case 87:
			camera.wasd[1] = false;
			break;
		case 68:
			camera.wasd[2] = false;
			break;
		case 83:
			camera.wasd[3] = false;
			break;
		case 81:
			camera.qe[0] = false;
			break;
		case 69:
			camera.qe[1] = false;
			break;
		case 112:
			document.getElementById('help').style.display = 'none';
			break;
		}
	};

	camera.update = function(dt) {
		var d_pitch = dt * ((camera.dirpad[1] ? 1 : 0) + (camera.dirpad[3] ? -1 : 0));
		var d_yaw = dt * ((camera.dirpad[0] ? 1 : 0) + (camera.dirpad[2] ? -1 : 0));
		var d_roll = dt * ((camera.qe[1] ? 10 : 0) + (camera.qe[0] ? -10 : 0)) * 0.2;
		var d_advance = dt * ((camera.wasd[1] ? 10 : 0) + (camera.wasd[3] ? -10 : 0));
		var d_strafe = dt * ((camera.wasd[2] ? 10 : 0) + (camera.wasd[0] ? -10 : 0));

		quat.rotateX(camera.rotate, camera.rotate, d_pitch);
		quat.rotateY(camera.rotate, camera.rotate, d_roll);
		quat.rotateZ(camera.rotate, camera.rotate, d_yaw);

		vec3.transformQuat(camera.up_r, camera.up, camera.rotate);
		vec3.transformQuat(camera.front_r, camera.front, camera.rotate);
		vec3.transformQuat(camera.right_r, camera.right, camera.rotate);

		camera.position[0] += camera.front_r[0] * d_advance + camera.right_r[0] * d_strafe;
		camera.position[1] += camera.front_r[1] * d_advance + camera.right_r[1] * d_strafe;
		camera.position[2] += camera.front_r[2] * d_advance + camera.right_r[2] * d_strafe;

		vec3.add(camera.center, camera.position, camera.front_r);
		
		mat4.lookAt(camera.view, camera.position, camera.center, camera.up_r);
		mat4.multiply(camera.vp, camera.projection, camera.view);
	};

	camera.resize = function(ar) {
		camera.ar = ar;
		mat4.perspective(camera.projection, Math.PI / 3, ar, 1.0, 100.0);
	}

	return camera;
}