import { BaseScene } from '../core/BaseScene';

// Components
import MainCamera from './Cameras/MainCamera';
import DebugCamera from './Cameras/DebugCamera';
import Grid from './Grid';
import Plane from './Plane';

export class MainScene extends BaseScene {
	init() {
		this.mainCamera = this.add(MainCamera);
		this.debugCamera = this.add(DebugCamera);
		this.camera = this.debugCamera;

		this.grid = this.add(Grid);
		this.plane = this.add(Plane);
	}

	update() {}

	debug() {
		const gui = this.webgl.gui;
		const folder = gui.addFolder({ title: 'Scene', expanded: true });
		const opts = [
			{ text: 'Main', value: this.mainCamera },
			{ text: 'Debug', value: this.debugCamera },
		];

		folder
			.addBlade({
				view: 'list',
				label: 'Cameras',
				options: opts,
				value: this.camera,
			})
			.on('change', (ev) => {
				this.camera = ev.value;
			});
	}
}
