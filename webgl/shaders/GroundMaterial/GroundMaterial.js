import { ShaderMaterial } from 'three';
import { getWebGL } from '../..';
import Shaders from './Shaders';

export class GroundMaterial extends ShaderMaterial {
	constructor(opts = {}) {
		super();
		const webgl = (this.webgl = getWebGL());

		this.uniforms = {
			...webgl.uniforms,
			tDiffuse: { value: null },
			tBlurred: { value: null },
			tDepth: { value: null },
			tBake: { value: webgl.textures.shadows },
			tNormal: { value: webgl.textures.normal },
			textureMatrix: { value: null },
			mirror: { value: 0.5 },
			debug: { value: 0 },
		};

		Shaders.use(this);
	}
}

let singleton = null;
GroundMaterial.use = () => (singleton = singleton ?? new GroundMaterial());
GroundMaterial.unuse = () => {};
