/* jshint strict: false */
/* exported grid */

var GRID_NUM = 500;
var GRID_INT = 1.0;

function grid() {
	var array = [];
	for(var i = -GRID_NUM; i <= GRID_NUM; i++) {
		array = array.concat([GRID_INT * GRID_NUM, GRID_INT * i, 0.0, 0.5, 0.4, 0.5]);
		array = array.concat([-GRID_INT * GRID_NUM, GRID_INT * i, 0.0, 0.5, 0.4, 0.5]);
		array = array.concat([GRID_INT * i, GRID_INT * GRID_NUM, 0.0, 0.4, 0.5, 0.5]);
		array = array.concat([GRID_INT * i, -GRID_INT * GRID_NUM, 0.0, 0.4, 0.5, 0.5]);
	}
	return array;
}