import { ShaderMaterial } from 'three';
import { getWebGL } from '../..';
import Shaders from './Shaders';

export class PlaneMaterial extends ShaderMaterial {
	constructor(opts = {}) {
		super();
		const webgl = (this.webgl = getWebGL());

		this.uniforms = {
			...webgl.uniforms,
		};

		Shaders.use(this);
	}
}

let singleton = null;
PlaneMaterial.use = () => (singleton = singleton ?? new PlaneMaterial());
PlaneMaterial.unuse = () => {};
