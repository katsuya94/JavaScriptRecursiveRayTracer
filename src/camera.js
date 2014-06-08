/* jshint strict: false */
/* global mat4, vec3, quat */
/* global FOV */
/* global camera: true */
/* exported init_camera, camera */

var camera;

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
	quat.rotateZ(camera.rotate, camera.rotate, 3 * Math.PI / 4);
	quat.rotateX(camera.rotate, camera.rotate, -Math.PI / 4);

	camera.position = vec3.fromValues(10, 10, 10);

	camera.view = mat4.create();
	camera.projection = mat4.create();
	camera.vp = mat4.create();

	camera.dirpad = [false, false, false, false];
	camera.wasd = [false, false, false, false];
	camera.qe = [false, false];
	camera.zx = [false, false];

	camera.update = function(dt) {
		var d_pitch = dt * ((camera.dirpad[1] ? 1 : 0) + (camera.dirpad[3] ? -1 : 0));
		var d_yaw = dt * ((camera.dirpad[0] ? 1 : 0) + (camera.dirpad[2] ? -1 : 0));
		var d_roll = dt * ((camera.qe[1] ? 1 : 0) + (camera.qe[0] ? -1 : 0));
		var d_advance = dt * ((camera.wasd[1] ? 10 : 0) + (camera.wasd[3] ? -10 : 0));
		var d_strafe = dt * ((camera.wasd[2] ? 10 : 0) + (camera.wasd[0] ? -10 : 0));
		var d_ascend = dt * ((camera.zx[1] ? 10 : 0) + (camera.zx[0] ? -10 : 0));

		quat.rotateX(camera.rotate, camera.rotate, d_pitch);
		quat.rotateY(camera.rotate, camera.rotate, d_roll);
		quat.rotateZ(camera.rotate, camera.rotate, d_yaw);

		vec3.transformQuat(camera.up_r, camera.up, camera.rotate);
		vec3.transformQuat(camera.front_r, camera.front, camera.rotate);
		vec3.transformQuat(camera.right_r, camera.right, camera.rotate);

		camera.position[0] += camera.front_r[0] * d_advance + camera.right_r[0] * d_strafe + camera.up_r[0] * d_ascend;
		camera.position[1] += camera.front_r[1] * d_advance + camera.right_r[1] * d_strafe + camera.up_r[1] * d_ascend;
		camera.position[2] += camera.front_r[2] * d_advance + camera.right_r[2] * d_strafe + camera.up_r[2] * d_ascend;

		vec3.add(camera.center, camera.position, camera.front_r);
		
		mat4.lookAt(camera.view, camera.position, camera.center, camera.up_r);
		mat4.multiply(camera.vp, camera.projection, camera.view);
	};

	camera.resize = function(ar) {
		camera.ar = ar;
		mat4.perspective(camera.projection, FOV, ar, 1.0, 100.0);
	};
}