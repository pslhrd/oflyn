import { Vector2, WebGLRenderTarget, LinearFilter } from 'three';
import fragmentShader from './blurPass.frag';
import createFilter from '../../utils/createFilter';
import { clampedMap } from '../../utils/maths';

export default function createBlurPass(webgl) {
	const renderer = webgl.threeRenderer;

	const baseRes = 2048;

	const params = {
		strength: 60,
		strengthTarget: 60,
	};

	if (webgl.gui) {
		webgl.gui.addBinding(params, 'strengthTarget', {
			label: 'DOF Strength',
			min: 0,
			max: 100,
		});
	}

	function createRT(scale) {
		const vec2 = new Vector2();
		renderer.getDrawingBufferSize(vec2);
		const rt = new WebGLRenderTarget(
			vec2.x * scale,
			vec2.y * scale,
			LinearFilter,
			LinearFilter,
		);

		return rt;
	}

	const rtA = createRT(0.15);
	const rtB = createRT(0.07);
	const rtC = createRT(0.3);

	const blurFilter = createFilter({
		renderer: webgl.threeRenderer,
		fragmentShader,
		uniforms: {
			blurStrength: { value: 0.0028 },
			blurAlpha: { value: 1 },
			inputBuffer: { value: null, type: 't' },
		},
	});

	function render(input) {
		const { inputBuffer, blurStrength } = blurFilter.uniforms;
		const rt = renderer.getRenderTarget();
		input = input?.texture || input || rt?.texture;
		inputBuffer.value = input;

		params.strength += (params.strengthTarget - params.strength) / 6;

		const strA = clampedMap(params.strength, 30, 100, 0, 0.01);
		const strB = clampedMap(params.strength, 50, 100, 0, 0.01);
		const strC = clampedMap(params.strength, 0, 100, 0, 0.015);

		if (strA > 0) {
			blurStrength.value = strA;
			renderer.setRenderTarget(rtA);
			renderer.clearColor();
			blurFilter.render();
			inputBuffer.value = rtA.texture;
		}

		if (strB > 0) {
			blurStrength.value = strB;
			renderer.setRenderTarget(rtB);
			renderer.clearColor();
			blurFilter.render();
			inputBuffer.value = rtB.texture;
		}

		blurStrength.value = strC;
		renderer.setRenderTarget(rtC);
		renderer.clearColor();
		blurFilter.render();
		renderer.setRenderTarget(rt);
		return api.outputTexture;
	}

	const api = {
		render,
		get outputTexture() {
			return rtC.texture;
		},
	};

	return api;
}
