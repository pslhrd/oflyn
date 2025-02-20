import {
	Camera,
	Mesh,
	RawShaderMaterial,
	ShaderMaterial,
	PlaneGeometry,
} from 'three';
import { bigTriangleGeometry, bigTriangleVertexShader } from './bigTriangle.js';

const cam = new Camera();
const defaultFragment =
	'precision highp float;' +
	'varying vec2 vUv;' +
	'void main(){gl_FragColor=vec4(vUv,0.,1.);}';

let screen;

const plane = new PlaneGeometry(1, 1);

export default function createFilter({
	renderer,
	useRawShader = true,
	vertexShader,
	fragmentShader,
	...materialOpts
} = {}) {
	if (!renderer) throw new Error('WebGL Renderer is required');

	const ShaderClass = useRawShader ? RawShaderMaterial : ShaderMaterial;

	const material = new ShaderClass(
		Object.assign(
			{},
			{
				vertexShader: bigTriangleVertexShader,
				fragmentShader: defaultFragment,
				depthTest: false,
				depthWrite: false,
				transparent: true,
			},
			materialOpts
		)
	);

	if (vertexShader) {
		if (vertexShader.use) vertexShader.use(material);
		else material.vertexShader = vertexShader;
	}

	if (fragmentShader) {
		if (fragmentShader.use) fragmentShader.use(material);
		else material.fragmentShader = fragmentShader;
	}

	if (!screen) {
		screen = new Mesh(bigTriangleGeometry, material);
		screen.frustumCulled = false;
		screen.matrixAutoUpdate = false;
		screen.matrixWorldAutoUpdate = false;
	}

	const obj = {
		cam,
		screen,
		material,
		uniforms: material.uniforms,
		u: material.uniforms,

		render() {
			const prevSort = renderer.sortObjects;
			const prevShadowMap = renderer.shadowMap.enabled;
			const prevAutoClear = renderer.autoclear;
			renderer.sortObjects = false;
			renderer.shadowMap.enabled = false;
			renderer.autoclear = false;

			screen.material = material;
			renderer.render(screen, cam);

			renderer.sortObjects = prevSort;
			renderer.shadowMap.enabled = prevShadowMap;
			renderer.autoclear = prevAutoClear;
		},
	};

	return obj;
}
