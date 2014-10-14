/* jshint strict: false */
/* global camera, snap_flag: true */

var LOCK_HELP_KEY = false;

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
		case 90:
			camera.zx[0] = true;
			break;
		case 88:
			camera.zx[1] = true;
			break;
		case 112:
			if (!LOCK_HELP_KEY) {
				if (document.getElementById('help').style.display == 'none') {
					document.getElementById('help').style.display = 'block';
				} else {
					document.getElementById('help').style.display = 'none';
				}
				LOCK_HELP_KEY = true;
			}
			break;
		case 32:
			snap_flag = true;
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
		case 90:
			camera.zx[0] = false;
			break;
		case 88:
			camera.zx[1] = false;
			break;
		case 112:
			LOCK_HELP_KEY = false;
			break;
		}
	};