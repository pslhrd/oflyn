import { ShaderMaterial } from 'three';
import { getWebGL } from '../..';
import Shaders from './Shaders';

export class BaseMaterial extends ShaderMaterial {
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
BaseMaterial.use = () => (singleton = singleton ?? new BaseMaterial());
BaseMaterial.unuse = () => {};
