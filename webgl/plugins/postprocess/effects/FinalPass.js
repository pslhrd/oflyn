import { BlendFunction, Effect } from 'postprocessing';
import { Uniform, Vector3 } from 'three';
import fragmentShader from './FinalPass.frag';

export default class FinalPass extends Effect {
	constructor() {
		super('FinalPass', fragmentShader, {
			blendFunction: BlendFunction.NORMAL,
			uniforms: new Map([
				['tDiffuse', new Uniform(null)],
				['bloomTexture', new Uniform(null)],
				['uNoiseStrength', new Uniform(0.07)],
				['uVignetteStrength', new Uniform(0.42)],
				['uVignetteColor', new Uniform(new Vector3(0, 0, 0))],
				['uMaxDistort', new Uniform(1.46)],
				['uBendAmount', new Uniform(-0.032)],
			]),
		});
	}
}
