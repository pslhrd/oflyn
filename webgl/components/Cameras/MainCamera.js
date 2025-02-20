import { BaseCamera } from '../../core/BaseCamera';
import { Object3D, PerspectiveCamera } from 'three';
export default class MainCamera extends BaseCamera {
	init() {
		this.base = new Object3D();
		this.cam = new PerspectiveCamera(
			55,
			this.webgl.viewport.viewportRatio,
			0.1,
			100,
		);
		this.base.add(this.cam);
	}
}
