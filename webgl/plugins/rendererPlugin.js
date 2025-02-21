import { WebGLRenderer, Vector2, Color } from 'three';
import { clamp } from '../utils/maths';

const pixelCountPreset = {
	'720p': 1280 * 720,
	'1080p': 1920 * 1080,
	'1440p': 2560 * 1440,
	'2k': 2560 * 1440,
	'3k': 2880 * 1620,
	'4k': 3840 * 2160,
	'5k': 5120 * 2880,
	'8k': 7680 * 4320,
};

export default function rendererPlugin(webgl) {
	let renderer;
	const clearColor = new Color('#7A7C79');
	let minPixelRatio = 1;
	let maxPixelRatio = 2;
	let maxPixelCount = pixelCountPreset['3k'];

	const drawingBufferSize = new Vector2();
	let pixelRatio = 1;

	const options = {
		antialias: false,
		alpha: false,
	};

	const api = {
		init,
		drawingBufferSize,
		pixelRatio,
		resize,
		destroy,
	};

	webgl.hooks.beforeFrame.watch(() => {
		renderer.info.reset();
	});

	function init() {
		options.canvas = webgl.canvas;
		renderer = new WebGLRenderer(options);
		renderer.setClearColor(clearColor);
		webgl.threeRenderer = renderer;

		resize();
	}

	function resize() {
		const { width, height, domHeight } = webgl.viewport;

		let pr = clamp(webgl.viewport.pixelRatio, minPixelRatio, maxPixelRatio);
		const currentSize = new Vector2();
		const domSize = new Vector2(width, height);
		renderer.getSize(currentSize);

		// Maximum pixel count
		let pixelCount = pr * width * height;
		if (maxPixelCount > 0 && pixelCount > maxPixelCount) {
			pr /= pixelCount / maxPixelCount;
		}

		if (renderer.getPixelRatio() !== pr) renderer.setPixelRatio(pr);
		if (!currentSize.equals(domSize))
			renderer.setSize(domSize.x, domSize.y);

		updateBufferSize();
	}

	function updateBufferSize() {
		const tVec2 = new Vector2();
		renderer.getDrawingBufferSize(tVec2);
		drawingBufferSize.copy(tVec2);
		pixelRatio = renderer.getPixelRatio();
	}

	function destroy() {
		renderer.dispose();
	}

	webgl.renderer = api;
}
