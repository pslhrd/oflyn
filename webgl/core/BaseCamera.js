import { BaseComponent } from './BaseComponent';
import { PerspectiveCamera } from 'three';

export function defaultCamera() {
	const ratio = window.innerWidth / window.innerHeight;
	const cam = new PerspectiveCamera(55, ratio, 0.1, 100);
	return cam;
}

export class BaseCamera extends BaseComponent {
	constructor(props = {}) {
		super(props);
		this.isCamera = true;
		this.isUsed = false;
	}

	afterInit() {
		if (this.cam && !this.base) this.base = this.cam;
		else if (!this.cam) this.cam = defaultCamera();
		if (!this.base) this.base = this.cam;

		this.webgl.hooks.resize.watch(this.resize.bind(this));

		this.resize();
	}

	resize() {
		this.cam.aspect =
			this.webgl.viewport.width / this.webgl.viewport.height;
		this.cam.updateProjectionMatrix();
	}

	used() {}
	unused() {}
}
