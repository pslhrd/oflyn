import { BaseComponent } from '../core/BaseComponent';
import { PlaneMaterial } from '../shaders/PlaneMaterial/PlaneMaterial';
import { Mesh, PlaneGeometry, Object3D } from 'three';

export default class Plane extends BaseComponent {
	init() {
		this.base = new Object3D();

		const geo = (this.geo = new PlaneGeometry(1, 1));
		this.mesh = new Mesh(geo, PlaneMaterial.use());

		this.base.add(this.mesh);
	}
}
