import { BaseCamera } from '../../core/BaseCamera';
import { Object3D, PerspectiveCamera, Vector3 } from 'three';
import { damp } from '../../utils/maths';
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

		this.offsetX = 0;
		this.offsetY = 0;
		this.breathingOffset = 0;

		this.tVecA = new Vector3();
		this.tVecB = new Vector3();

		this.currentX = 0;
		this.currentY = 0;

		const blenderCam = this.webgl.geometries.camera;
		this.cam.position.copy(blenderCam.position);
		this.cam.quaternion.copy(blenderCam.quaternion);
		this.cam.fov = blenderCam.fov * 1.2;
	}

	update() {
		const dt = this.webgl.time.dt;
		this.breathingOffset += dt / 16.6667;

		const mult = 0.01;
		const amplitude = 0.02;

		this.tVecA.x = damp(
			this.tVecA.x,
			Math.sin(this.breathingOffset * mult) * amplitude,
			0.1,
			dt,
		);
		this.tVecA.y = damp(
			this.tVecA.y,
			Math.cos(this.breathingOffset * mult) * amplitude,
			0.1,
			dt,
		);
		this.tVecA.z = damp(
			this.tVecA.z,
			Math.cos(this.breathingOffset * mult) * amplitude,
			0.1,
			dt,
		);

		this.base.position.copy(this.tVecA);

		const x = (this.offsetX = damp(
			this.offsetX,
			this.webgl.touch.normalizePos.x,
			0.1,
			dt,
		));
		const y = (this.offsetY = damp(
			this.offsetY,
			this.webgl.touch.normalizePos.y,
			0.1,
			dt,
		));

		const mouseMult = 0.15;
		const xMult = 3;
		const yMult = 0.5;

		this.base.position.z -= x * 2 * mouseMult * xMult;
		this.base.position.y -= y * 2 * mouseMult * yMult;

		this.base.rotation.y = -x * mouseMult * xMult * 0.2;
		this.base.rotation.z = y * mouseMult * yMult * 0.2;
		// this.base.rotation.z = -x * mouseMult * 0.2;
	}
}
