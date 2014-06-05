/* jshint strict: false */
/* exported FSIZE */

var ASIZE = (new Float32Array()).BYTES_PER_ELEMENT;
var ESIZE = (new Uint16Array()).BYTES_PER_ELEMENT;
var VSIZE = 3;

var FOV = Math.PI / 3;
var T_2 = Math.tan(FOV / 2);