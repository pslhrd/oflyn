import { MeshBasicMaterial, Object3D, VideoTexture } from 'three';
import { BaseComponent } from '../core/BaseComponent';

export default class VideoPlane extends BaseComponent {
	init() {
		this.base = new Object3D();

		const plane = this.webgl.geometries.videoplane;
		const video = document.querySelector('video');
		this.videoTexture = new VideoTexture(video);
		const material = new MeshBasicMaterial({
			map: this.videoTexture,
		});

		plane.material?.dispose();
		plane.material = material;
		this.base.add(plane);
	}
}
