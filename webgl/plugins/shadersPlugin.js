import { Vector2, Vector4 } from 'three';

export default function shadersPlugin(webgl) {
	const uniforms = {
		time: { type: 'f', value: 0 },
		viewport: { type: 'v4', value: new Vector4() },
		res: { type: 'v2', value: new Vector2() },
	};

	const defines = {
		PI: Math.PI,
		PI2: Math.PI * 2,
		PI_HALF: Math.PI * 0.5,
	};

	function resize() {
		const { viewport, res } = uniforms;
		const { width, height, pixelRatio, viewportRatio } = webgl.viewport;

		viewport.value.set(width, height, pixelRatio, viewportRatio);
		res.value.copy(webgl.renderer.drawingBufferSize);
	}

	function update() {
		const { elapsed: et, stableDt: dt } = webgl.time;
		uniforms.time.value = et * 0.001;
	}

	Object.assign(webgl, {
		uniforms,
		defines,
		shaders: {
			resize,
			update,
		},
	});
}
