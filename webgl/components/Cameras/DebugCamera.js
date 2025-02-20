import { BaseCamera } from '../../core/BaseCamera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Object3D, PerspectiveCamera, Vector3, Quaternion } from 'three';

const STORAGE_NAME = 'orbitPos';
const BASE_POS = { x: 1, y: 1, z: 1 };

export default class DebugCamera extends BaseCamera {
	init() {
		this.base = new Object3D();
		this.cam = new PerspectiveCamera(
			45,
			this.webgl.viewport.viewportRatio,
			1,
			1000,
		);

		const pos = localStorage.getItem(STORAGE_NAME)
			? JSON.parse(localStorage.getItem(STORAGE_NAME))
			: null;

		if (pos) {
			this.cam.position.set(pos.x, pos.y, pos.z);
		} else {
			this.cam.position.set(1, 1, 1).multiplyScalar(10);
		}

		this.controls = new OrbitControls(this.cam, this.webgl.canvas);
		this.controls.enabled = false;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;

		this.controls.addEventListener('end', this.savePosition.bind(this));

		this.base.add(this.cam);
	}

	getPosition() {}

	savePosition() {
		localStorage.setItem(STORAGE_NAME, JSON.stringify(this.cam.position));
	}

	update() {
		if (!this.isUsed) return;
		this.controls.update();
	}

	used() {
		this.controls.enabled = true;
	}

	unused() {
		this.controls.enabled = false;
	}
}
