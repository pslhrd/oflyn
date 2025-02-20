import { BaseComponent } from './BaseComponent';
import { Scene } from 'three';
import { BaseCamera } from './BaseCamera';

function toggleCam(cam, state) {
	if (!cam || cam.isUsed == state) return;
	cam.isUsed = !!state;
	if (cam.isUsed) cam.used();
	else cam.unused();
}

export class BaseScene extends BaseComponent {
	constructor(props = {}) {
		super(props, true);
		this.isScene = true;
		this._cam = { current: false, forced: false };
	}

	triggerInit() {
		if (this.isInit) return;
		this.base = new Scene();
		super.triggerInit();
	}

	render() {
		const renderer = this.webgl.threeRenderer;
		const camera = this.getCurrentCamera();
		if (!camera) return;
		renderer.render(this.base, camera.cam);
	}

	get camera() {
		return this._cam.current;
	}
	set camera(v) {
		if (!v || !v.isCamera) v = false;
		const cam = this._cam;
		if (cam.current === v) return;
		toggleCam(cam.current, false);
		cam.current = v;
		toggleCam(cam.current, true);
	}

	getCurrentCamera() {
		return this._cam.forced || this._cam.current;
	}

	triggerRender() {
		if (this.beforeRender) this.beforeRender();
		this.render();
		if (this.afterRender) this.afterRender();
	}

	destroy() {
		super.destroy();
	}
}
