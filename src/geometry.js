function floor_hit(ray, col) {
	var origin = param_ray(ray, col.t);
	var m = (((Math.floor(origin[0]) + Math.floor(origin[1])) % 2) == 0) ? BLACK_PLASTIC : WHITE_PLASTIC;
	return new Hit(ray, origin, Z, m)
}

function floor_col(ray) {
	var t = vec3.dot(ray.p, Z) / vec3.dot(ray.u, _Z);
	return t > 0 ? { t: t } : null;
}

function scene_a(buffers, tracer) {
	var draw_axes = buffers.arrayDraw([
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0
	], 'LINES');
	var axes = new Entity(draw_axes, mat4.create(), undefined, undefined);
	buffers.register(axes)

	var draw_grid = buffers.arrayDraw(grid(), 'LINES');
	var floor = new Entity(draw_grid, mat4.create(), floor_col, floor_hit);
	buffers.register(floor);
	tracer.register(floor);

	// Spheres

	var draw_sphere = buffers.elementDraw(sphere_mesh().vertices, sphere_mesh().indices, 'TRIANGLES');

	function sphere(ray) {
		var a = ray.u[0] * ray.u[0] + ray.u[1] * ray.u[1] + ray.u[2] * ray.u[2];
		var b = 2 * (ray.p[0] * ray.u[0] + ray.p[1] * ray.u[1] + ray.p[2] * ray.u[2]);
		var c = ray.p[0] * ray.p[0] + ray.p[1] * ray.p[1] + ray.p[2] * ray.p[2] - 1;

		var t_1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		var t_2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

		var t;

		if (t_1 && t_1 > 0) {
			if (t_2 && t_2 > 0) {
				t = t_1 < t_2 ? t_1 : t_2;
			} else {
				t = t_1;
			}
		} else if (t_2 && t_2 > 0) {
			t = t_2;
		} else {
			return null;
		}
		return { t: t };
	}

	function metal(ray, col) {
		var origin = param_ray(ray, col.t);
		return new Hit(ray, origin, origin, METAL);
	}

	var transform = mat4.create();
	mat4.translate(transform, transform, [0, 0, 2]);
	mat4.scale(transform, transform, [2, 2, 2]);

	var sphere_a = new Entity(draw_sphere, transform, sphere, metal);
	tracer.register(sphere_a);
	buffers.register(sphere_a);

	transform = mat4.create();
	mat4.translate(transform, transform, [-2.5, 0, 2]);
	mat4.scale(transform, transform, [0.5, 2, 2]);

	var sphere_b = new Entity(draw_sphere, transform, sphere, metal);
	tracer.register(sphere_b);
	buffers.register(sphere_b);

	transform = mat4.create();
	mat4.translate(transform, transform, [2.5, 0, 2]);
	mat4.scale(transform, transform, [0.5, 2, 2]);

	var sphere_c = new Entity(draw_sphere, transform, sphere, metal);
	tracer.register(sphere_c);
	buffers.register(sphere_c);

	transform = mat4.create();
	mat4.translate(transform, transform, [0, -2.5, 2]);
	mat4.scale(transform, transform, [2, 0.5, 2]);

	var sphere_d = new Entity(draw_sphere, transform, sphere, metal);
	tracer.register(sphere_d);
	buffers.register(sphere_d);

	transform = mat4.create();
	mat4.translate(transform, transform, [0, 2.5, 2]);
	mat4.scale(transform, transform, [2, 0.5, 2]);

	var sphere_e = new Entity(draw_sphere, transform, sphere, metal);
	tracer.register(sphere_e);
	buffers.register(sphere_e);

	tracer.light(new Light(
		vec3.fromValues(20.0, 0.0, 20.0),
		vec3.fromValues(0.5, 0.4, 0.3),
		vec3.fromValues(0.5, 0.4, 0.3),
		vec3.fromValues(0.5, 0.4, 0.3)));

	tracer.light(new Light(
		vec3.fromValues(-20.0, 0.0, 20.0),
		vec3.fromValues(0.3, 0.4, 0.5),
		vec3.fromValues(0.3, 0.4, 0.5),
		vec3.fromValues(0.3, 0.4, 0.5)));
}

function scene_b(buffers, tracer) {
	var draw_axes = buffers.arrayDraw([
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		1.0, 0.0, 0.0, 0.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 0.0, 0.0
	], 'LINES');
	var axes = new Entity(draw_axes, mat4.create(), undefined, undefined);
	buffers.register(axes)

	var draw_grid = buffers.arrayDraw(grid(), 'LINES');
	var floor = new Entity(draw_grid, mat4.create(), floor_col, floor_hit);
	buffers.register(floor);
	tracer.register(floor);

	// Cube
	var sample = function() { return vec3.fromValues(1.0, 0.0, 1.0); };
	var tex = new Image();
	tex.addEventListener('load', function() {
		var ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = tex.width;
		ctx.canvas.height = tex.height;
		ctx.drawImage(tex, 0, 0);
		data = ctx.getImageData(0, 0, tex.width, tex.height).data;
		sample = function(x, y) {
			var u = x * tex.width;
			var v = y * tex.height;
			x = ~~u;
			y = ~~v;
			_x = (x + 1) % tex.width;
			_y = (y + 1) % tex.height;
			var dx = u - x;
			var _dx = 1 - dx
			var dy = v - y;
			var _dy = 1 - dy;
			
			var ul = vec3.fromValues(
				data[tex.width * 4 * y + x * 4],
				data[tex.width * 4 * y + x * 4 + 1],
				data[tex.width * 4 * y + x * 4 + 2]);
			var ur = vec3.fromValues(
				data[tex.width * 4 * y + _x * 4],
				data[tex.width * 4 * y + _x * 4 + 1],
				data[tex.width * 4 * y + _x * 4 + 2]);
			var ll = vec3.fromValues(
				data[tex.width * 4 * _y + x * 4],
				data[tex.width * 4 * _y + x * 4 + 1],
				data[tex.width * 4 * _y + x * 4 + 2]);
			var lr = vec3.fromValues(
				data[tex.width * 4 * _y + _x * 4],
				data[tex.width * 4 * _y + _x * 4 + 1],
				data[tex.width * 4 * _y + _x * 4 + 2]);
			var l = vec3.fromValues(
				_dx * ll[0] + dx * lr[0],
				_dx * ll[1] + dx * lr[1],
				_dx * ll[2] + dx * lr[2]);
			var u = vec3.fromValues(
				_dx * ul[0] + dx * ur[0],
				_dx * ul[1] + dx * ur[1],
				_dx * ul[2] + dx * ur[2]);
			return vec3.fromValues(
				(dy * l[0] + _dy * u[0]) / 256,
				(dy * l[1] + _dy * u[1]) / 256,
				(dy * l[2] + _dy * u[2]) / 256);
		}
	}, false);
	tex.src = 'normal.jpg';

	function bump_side(ray, n, u, v, a, b) {
		var d = vec3.dot(ray.u, n);
		if (d < 0) {
			var t = -(vec3.dot(ray.p, n) - 1) / d;
			if (t > 0) {
				var origin = param_ray(ray, t);
				if (origin[a] < 1 && origin[a] > -1 && origin[b] < 1 && origin[b] > -1) {
					return { t: t, origin: origin, normal: n, a: a, b: b, u: u, v: v }
				}
			}
		}
		return null;
	};

	function bump_cube(ray) {
		var h;

		h = bump_side(ray, X, Y, Z, 1, 2);
		if (h) return h;
		h = bump_side(ray, _X, _Y, _Z, 1, 2);
		if (h) return h;
		h = bump_side(ray, Y, Z, X, 0, 2);
		if (h) return h;
		h = bump_side(ray, _Y, _Z, _X, 0, 2);
		if (h) return h;
		h = bump_side(ray, Z, X, Y, 0, 1);
		if (h) return h;
		h = bump_side(ray, _Z, _X, _Y, 0, 1);
		if (h) return h;
		
		return null;
	};

	function bump_hit(ray, col) {
		var normal = vec3.clone(col.normal);
		var s = sample(col.origin[col.a] / 2 + 0.5, col.origin[col.b] / 2 + 0.5);
		vec3.scaleAndAdd(normal, normal, col.u, (s[0] - 0.5) * 2);
		vec3.scaleAndAdd(normal, normal, col.v, (s[1] - 0.5) * 2);
		vec3.normalize(normal, normal);
		return new Hit(ray, col.origin, normal, PEWTER)
	}

	var transform = mat4.create();
	mat4.translate(transform, transform, [0, 0, 2]);
	mat4.scale(transform, transform, [2, 2, 2]);

	var draw_cube = buffers.arrayDraw(box(), 'TRIANGLES');

	var cube_a = new Entity(draw_cube, transform, bump_cube, bump_hit);
	buffers.register(cube_a);
	tracer.register(cube_a);

	function side(ray, n, a, b) {
		var d = vec3.dot(ray.u, n);
		if (d < 0) {
			var t = -(vec3.dot(ray.p, n) - 1) / d;
			if (t > 0) {
				var origin = param_ray(ray, t);
				if (origin[a] < 1 && origin[a] > -1 && origin[b] < 1 && origin[b] > -1) {
					return { t: t, normal: n }
				}
			}
		}
		return null;
	};

	function cube(ray) {
		var h;

		h = side(ray, X, 1, 2);
		if (h) return h;
		h = side(ray, _X, 1, 2);
		if (h) return h;
		h = side(ray, Y, 2, 0);
		if (h) return h;
		h = side(ray, _Y, 2, 0);
		if (h) return h;
		h = side(ray, Z, 0, 1);
		if (h) return h;
		h = side(ray, _Z, 0, 1);
		if (h) return h;
		
		return null;
	};

	function red_hit(ray, col) {
		var origin = param_ray(ray, col.t);
		return new Hit(ray, origin, col.normal, RED_PLASTIC);
	}

	function cyan_hit(ray, col) {
		var origin = param_ray(ray, col.t);
		return new Hit(ray, origin, col.normal, CYAN_PLASTIC);
	}

	function green_hit(ray, col) {
		var origin = param_ray(ray, col.t);
		return new Hit(ray, origin, col.normal, GREEN_PLASTIC);
	}

	function magenta_hit(ray, col) {
		var origin = param_ray(ray, col.t);
		return new Hit(ray, origin, col.normal, MAGENTA_PLASTIC);
	}

	transform = mat4.create();
	mat4.translate(transform, transform, [0, 6, 8]);
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.rotateX(transform, transform, Math.PI / 4);

	var cube_b = new Entity(draw_cube, transform, cube, red_hit);
	buffers.register(cube_b);
	tracer.register(cube_b);

	transform = mat4.create();
	mat4.translate(transform, transform, [0, -6, 8]);
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.rotateX(transform, transform, -Math.PI / 4);

	var cube_c = new Entity(draw_cube, transform, cube, cyan_hit);
	buffers.register(cube_c);
	tracer.register(cube_c);

	transform = mat4.create();
	mat4.translate(transform, transform, [6, 0, 8]);
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.rotateY(transform, transform, Math.PI / 4);

	var cube_d = new Entity(draw_cube, transform, cube, green_hit);
	buffers.register(cube_d);
	tracer.register(cube_d);

	transform = mat4.create();
	mat4.translate(transform, transform, [-6, 0, 8]);
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.rotateY(transform, transform, -Math.PI / 4);

	var cube_e = new Entity(draw_cube, transform, cube, magenta_hit);
	buffers.register(cube_e);
	tracer.register(cube_e);

	tracer.light(new Light(
		vec3.fromValues(0.0, 0.0, 20.0),
		vec3.fromValues(0.5, 0.5, 0.5),
		vec3.fromValues(0.5, 0.5, 0.5),
		vec3.fromValues(0.5, 0.5, 0.5)));
	tracer.light(new Light(
		vec3.fromValues(20.0, 20.0, 20.0),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2)));
	tracer.light(new Light(
		vec3.fromValues(-20.0, 20.0, 20.0),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2)));
	tracer.light(new Light(
		vec3.fromValues(20.0, -20.0, 20.0),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2)));
	tracer.light(new Light(
		vec3.fromValues(-20.0, -20.0, 20.0),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2),
		vec3.fromValues(0.0, 0.0, 0.2)));
}