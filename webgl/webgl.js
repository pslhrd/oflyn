import viewportPlugin from './plugins/viewportPlugin';
import timePlugin from './plugins/timePlugin';
import rendererPlugin from './plugins/rendererPlugin';
import shadersPlugin from './plugins/shadersPlugin';
import guiPlugin from './plugins/guiPlugin';
import debugPlugin from './plugins/debugPlugin';
import loaderPlugin from './plugins/loaderPlugin';
import postprocessPlugin from './plugins/postprocess/postprocess';
import touchPlugin from './plugins/touchPlugin';
import { MainScene } from './components/Scene';

export default function createWebGL(webgl) {
	Object.assign(webgl, {
		init,
		preload,
		start,
		update,
		render,
		resize,
		destroy,
	});

	webgl.usePlugins([
		viewportPlugin,
		timePlugin,
		rendererPlugin,
		shadersPlugin,
		loaderPlugin,
		postprocessPlugin,
		touchPlugin,
		guiPlugin,
		debugPlugin,
	]);

	async function init() {
		webgl.renderer.init();
		webgl.loader.init();
		webgl.scene = new MainScene();
		webgl.hooks.resize.watch(resize);
	}

	async function preload() {
		await webgl.loader.preload();
	}

	function start() {
		webgl.time.init();
		webgl.scene.triggerInit();
		webgl.postprocess.init();
	}

	function update() {
		webgl.shaders.update();
		webgl.postprocess.update();
		webgl.scene.triggerUpdate();
	}

	function render() {
		if (webgl.postprocess.enabled) {
			webgl.postprocess.render();
		} else {
			const renderer = webgl.threeRenderer;
			webgl.scene.triggerRender();
			renderer.setRenderTarget(null);
		}
	}

	function resize() {
		webgl.renderer.resize();
		webgl.shaders.resize();
	}

	function destroy() {}
}
