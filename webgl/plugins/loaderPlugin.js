import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { loadTexture } from '../utils/loadTexture';
import assets from '../assets';

export default function loaderPlugin(webgl) {
	const api = {
		geometries: {},
		textures: {},
		init,
		preload,
	};

	const gltfLoader = new GLTFLoader();

	async function init() {}

	async function preload() {
		const p = [];

		const textures = [[assets.shadows, 'shadows']];

		p.push(
			loadTexture(assets.shadows, {
				repeat: false,
				flipY: true,
				onLoad: (v) => {
					api.textures.shadows = v;
				},
			}),
		);

		p.push(
			loadTexture(assets.normal, {
				repeat: true,
				flipY: true,
				onLoad: (v) => {
					api.textures.normal = v;
				},
			}),
		);

		p.push(
			loadGLTF('/models/scene.glb', {
				onLoad: (glb) => {
					const scene = glb.scene;
					const meshs = scene.children;

					meshs.forEach((mesh) => {
						api.geometries[mesh.name.toLowerCase()] = mesh;
					});
				},
			}),
		);

		await Promise.all(p);
	}

	async function loadGLTF(url, opts) {
		return new Promise((res, rej) => {
			gltfLoader.load(
				url,
				(data) => {
					opts.onLoad(data);
					res(data);
				},
				(xhr) => {
					webgl.states.loadingProgress =
						(xhr.loaded / xhr.total) * 100;
				},
			);
		});
	}

	webgl.loader = api;
	webgl.textures = api.textures = {};
	webgl.geometries = api.geometries = {};
}
