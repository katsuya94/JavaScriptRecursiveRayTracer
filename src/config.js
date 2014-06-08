/* jshint strict: false */
/* exported ASIZE, ESIZE, VSIZE, FOV, T_2 */

var ASIZE = (new Float32Array()).BYTES_PER_ELEMENT;
var ESIZE = (new Uint16Array()).BYTES_PER_ELEMENT;
var VSIZE = 6;

var FOV = Math.PI / 3;
var T_2 = Math.tan(FOV / 2);