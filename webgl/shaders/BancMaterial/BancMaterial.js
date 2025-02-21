import { ShaderMaterial } from 'three';
import { getWebGL } from '../..';
import Shaders from './Shaders';

export class BancMaterial extends ShaderMaterial {
	constructor(opts = {}) {
		super();
		const webgl = (this.webgl = getWebGL());

		this.uniforms = {
			...webgl.uniforms,
			tMap: { value: null },
			textureMatrix: { value: null },
			mirror: { value: 0.5 },
			debug: { value: 0 },
		};

		Shaders.use(this);
	}
}

let singleton = null;
BancMaterial.use = () => (singleton = singleton ?? new BancMaterial());
BancMaterial.unuse = () => {};
