/* jshint strict: false */
/* exported grid */

var GRID_SIZE = 500;

function grid() {
	var array = [
		GRID_SIZE, GRID_SIZE, 0.0, 0.0, 0.0, 1.0,
		GRID_SIZE, -GRID_SIZE, 0.0, 0.0, 0.0, 1.0,
		-GRID_SIZE, GRID_SIZE, 0.0, 0.0, 0.0, 1.0,
		-GRID_SIZE, -GRID_SIZE, 0.0, 0.0, 0.0, 1.0,
	];
	return array;
}