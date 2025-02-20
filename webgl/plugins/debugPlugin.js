export default function debugPlugin(webgl) {
	if (!webgl.gui) return;

	const debug = webgl.gui;
	const fstats = debug.addFolder({ title: 'Stats', index: 0 });

	const stats = {
		fps: 60,
		programs: 0,
		geometries: 0,
		textureMemory: 0,
		geometryMemory: 0,
		textures: 0,
		drawcalls: 0,
		triangles: 0,
		matrixUpdates: 0,
	};

	for (const k in stats) {
		const opts = { interval: 30, readonly: true };
		if (k !== 'fps') opts.format = (v) => Math.floor(v);

		if (k === 'textureMemory' || k === 'geometryMemory') {
			opts.format = (v) => ~~v + 'mb';
		}

		stats['_' + k] = fstats.addBinding(stats, k, opts);
	}

	let fpsFrames = 0;
	let fpsStartDate = performance.now();

	function updateFps() {
		const t = performance.now();
		const elapsedTime = t - fpsStartDate;
		if (elapsedTime > 1000) {
			const fps = (fpsFrames * 1000) / elapsedTime;
			fpsFrames = 0;
			fpsStartDate = t;
			if (stats.fps !== fps) {
				stats.fps = fps;
				stats._fps.refresh();
			}
		}
		fpsFrames++;
	}

	let threeDate = performance.now();
	function updateThreeProps() {
		const t = performance.now();
		const elapsedTime = t - threeDate;
		if (elapsedTime < 200) return;
		threeDate = t;

		const info = webgl.threeRenderer.info;

		const programs = info.programs.length;
		if (programs !== stats.programs) {
			stats.programs = programs;
			stats._programs.refresh();
		}

		const geometries = info.memory.geometries;
		if (geometries !== stats.geometries) {
			stats.geometries = geometries;
			stats._geometries.refresh();
		}

		const textures = info.memory.textures;
		if (textures !== stats.textures) {
			stats.textures = textures;
			stats._textures.refresh();
		}

		const drawcalls = info.render.calls;
		if (drawcalls !== stats.drawcalls) {
			stats.drawcalls = drawcalls;
			stats._drawcalls.refresh();
		}

		const triangles = info.render.triangles;
		if (triangles !== stats.triangles) {
			stats.triangles = triangles;
			stats._triangles.refresh();
		}

		const geoMem = info.memory.geometries;
		if (geoMem !== stats.geometryMemory) {
			stats.geometryMemory = geoMem;
			stats._geometryMemory.refresh();
		}

		const texMem = info.memory.textures;
		if (texMem !== stats.textureMemory) {
			stats.textureMemory = texMem;
			stats._textureMemory.refresh();
		}
	}

	function update() {
		updateThreeProps();
		updateFps();
	}

	webgl.hooks.afterFrame.watch(update);
}
