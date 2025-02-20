import createRuller from './viewport/createRuller';
import { debounce } from '../utils/async';
import { signal } from '../utils/signal';

export default function viewportPlugin(webgl) {
	let ruller;

	const dbUpdate = debounce(update, 200, { trail: false });

	const api = {
		width: 10,
		height: 10,
		domHeight: 10,
		viewportRatio: 1,
		pixelRatio: 1,
		visible: true,
		scrollBar: 0,
	};

	function init() {
		ruller = createRuller();
		api.scrollBar = ruller.measureScrollbarWidth();

		document.addEventListener('visibilitychange', updateVisibility, false);
		window.addEventListener(
			'resize',
			() => {
				dbUpdate();
			},
			false,
		);

		webgl.hooks.resize = signal();

		update();
	}

	function update() {
		updatePixelRatio();
		api.width = window.innerWidth;
		api.height = window.innerHeight;
		api.domHeight = ruller.measureViewportHeight();
		api.viewportRatio = api.width / api.height;

		webgl.hooks.resize.emit();
	}

	function updatePixelRatio() {
		api.pixelRatio = window.devicePixelRatio || 1;
	}

	function updateVisibility() {
		api.visible = !document.hidden;
		update();
	}

	init();

	webgl.viewport = api;
}
