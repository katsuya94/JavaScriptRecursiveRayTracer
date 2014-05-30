function geometry(buffers, tracer) {
	var axes = new Entity([
		0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 1.0, 0.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 0.0,

		0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 0.0, 0.0, 1.0,
	], undefined, mat4.create(), undefined);
	buffers.arrayDraw(axes, 'TRIANGLES');

	var floor = new Entity(grid(), undefined, mat4.create(), function(ray) {
		var t = vec3.dot(ray.p, Z) / vec3.dot(ray.u, _Z);
		if (t < 0) return null;
		var origin = vec3.create();
		vec3.scaleAndAdd(origin, ray.p, ray.u, t);
		var m = (((Math.floor(origin[0]) + Math.floor(origin[1])) % 2) == 0) ? BLACK_PLASTIC : WHITE_PLASTIC;
		return new Hit(ray, origin, Z, m);
	});
	buffers.arrayDraw(floor, 'LINES');
	tracer.register(floor);

	var transform = mat4.create();
	mat4.scale(transform, transform, [3, 6, 3]);
	mat4.translate(transform, transform, [0, 0, 3]);

	var egg = new Entity(undefined, undefined, transform, function(ray) {
		var a = ray.u[0] * ray.u[0] + ray.u[1] * ray.u[1] + ray.u[2] * ray.u[2];
		var b = 2 * (ray.p[0] * ray.u[0] + ray.p[1] * ray.u[1] + ray.p[2] * ray.u[2]);
		var c = ray.p[0] * ray.p[0] + ray.p[1] * ray.p[1] + ray.p[2] * ray.p[2] - 1;

		var t_1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		var t_2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

		var v_1 = vec3.create();
		if (t_1 && t_1 > 0) vec3.scaleAndAdd(v_1, ray.p, ray.u, t_1);

		var v_2 = vec3.create();
		if (t_2 && t_2 > 0) vec3.scaleAndAdd(v_2, ray.p, ray.u, t_2);

		var v;

		if (t_1 && t_1 > 0 && vec3.dot(v_1, ray.u) < 0) {
			v = v_1;
		} else if (t_2 && t_2 > 0) {
			v = v_2;
		}

		if (v) {
			m = (Math.floor(v[1] / 0.2) % 2) == 0 ? PEWTER : _PEWTER;
			var n = vec3.clone(v);
			return new Hit(ray, v, n, m);
		} else {
			return null;
		}
	});
	tracer.register(egg);

	var metal = function(ray) {
		var a = ray.u[0] * ray.u[0] + ray.u[1] * ray.u[1] + ray.u[2] * ray.u[2];
		var b = 2 * (ray.p[0] * ray.u[0] + ray.p[1] * ray.u[1] + ray.p[2] * ray.u[2]);
		var c = ray.p[0] * ray.p[0] + ray.p[1] * ray.p[1] + ray.p[2] * ray.p[2] - 1;

		var t_1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
		var t_2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

		var v_1 = vec3.create();
		if (t_1 && t_1 > 0) vec3.scaleAndAdd(v_1, ray.p, ray.u, t_1);

		var v_2 = vec3.create();
		if (t_2 && t_2 > 0) vec3.scaleAndAdd(v_2, ray.p, ray.u, t_2);

		var v;

		if (t_1 && t_1 > 0 && vec3.dot(v_1, ray.u) < 0) {
			v = v_1;
		} else if (t_2 && t_2 > 0) {
			v = v_2;
		}

		if (v) {
			var n = vec3.clone(v);
			return new Hit(ray, v, n, METAL);
		} else {
			return null;
		}
	}

	transform = mat4.create();
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.translate(transform, transform, [1, 0, 1]);

	var sphere_a = new Entity(undefined, undefined, transform, metal);
	tracer.register(sphere_a);

	transform = mat4.create();
	mat4.scale(transform, transform, [2, 2, 2]);
	mat4.translate(transform, transform, [-1, 0, 1]);

	var sphere_b = new Entity(undefined, undefined, transform, metal);
	tracer.register(sphere_b);

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