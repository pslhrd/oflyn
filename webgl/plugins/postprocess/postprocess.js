import {
	BloomEffect,
	EffectComposer,
	EffectPass,
	RenderPass,
	SavePass,
} from 'postprocessing';
import FinalPass from './effects/FinalPass';

export default function postprocessPlugin(webgl) {
	let composer, bloomEffect, customEffect;

	const api = {
		enabled: true,
		init,
		update,
		render,
		resize,
		updateCamera,
	};

	webgl.postprocess = api;

	function init() {
		const camera = webgl.scene.camera.cam;
		const scene = webgl.scene.base;

		composer = new EffectComposer(webgl.threeRenderer);
		composer.addPass(new RenderPass(scene, camera));

		bloomEffect = new BloomEffect({
			luminanceThreshold: 0.9,
			luminanceSmoothing: 0.025,
			intensity: 1.0,
		});

		const bloomPass = new EffectPass(camera, bloomEffect);
		composer.addPass(bloomPass);

		const savePass = new SavePass();
		composer.addPass(savePass);

		customEffect = new FinalPass();
		customEffect.uniforms.get('bloomTexture').value =
			savePass.renderTarget.texture;

		const renderToScreen = new EffectPass(camera, customEffect);
		composer.addPass(renderToScreen);

		if (webgl.gui) _debug();
	}

	function update() {}

	function render() {
		composer?.render();
	}

	function resize() {}

	function updateCamera() {
		composer?.setMainCamera(webgl.scene.camera.cam);
	}

	function _debug() {
		const bloomFolder = webgl.gui.addFolder({ title: 'Bloom Effect' });

		bloomFolder.addBinding(bloomEffect, 'intensity', {
			min: 0,
			max: 3,
			step: 0.01,
		});
		bloomFolder.addBinding(bloomEffect.luminanceMaterial, 'threshold', {
			label: 'Luminance Threshold',
			min: 0,
			max: 1,
			step: 0.01,
		});
		bloomFolder.addBinding(bloomEffect.luminanceMaterial, 'smoothing', {
			label: 'Luminance Smoothing',
			min: 0,
			max: 1,
			step: 0.01,
		});

		const blurFolder = bloomFolder.addFolder({ title: 'Blur Settings' });
		blurFolder.addBinding(bloomEffect.blurPass, 'scale', {
			min: 0,
			max: 5,
			step: 0.01,
		});
		blurFolder.addBinding(bloomEffect.blurPass, 'kernelSize', {
			options: {
				VERY_SMALL: 0,
				SMALL: 1,
				MEDIUM: 2,
				LARGE: 3,
				VERY_LARGE: 4,
				HUGE: 5,
			},
		});
	}
}
