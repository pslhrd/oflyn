import { Object3D, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { BaseComponent } from '../core/BaseComponent';
import Reflector from './Reflector';
import { BancMaterial } from '../shaders/BancMaterial/BancMaterial';

export default class Room extends BaseComponent {
	init() {
		this.base = new Object3D();

		const banc = this.webgl.geometries.banc.clone();
		const ground = this.webgl.geometries.ground;
		const wall = this.webgl.geometries.wall;
		const emissive = this.webgl.geometries.emissive;
		const cables = this.webgl.geometries.cables;

		this.banc = banc;
		this.bancMaterial = new BancMaterial();
		this.overrideMaterial = new MeshBasicMaterial({ color: 'black' });
		banc.material = this.overrideMaterial;

		emissive.material = new MeshBasicMaterial({ color: 'white' });

		this.base.add(emissive);
		this.base.add(banc);
		this.base.add(wall);
		this.base.add(cables);
		// this.base.add(blenderReflector);

		this.groundReflector = this.createGroundReflector();
		this.mirrors = this.createMirrors();

		this.webgl.hooks.beforeFrame.watch(this.render.bind(this));
	}

	createMirrors() {
		const mirrors = [];

		const { top, left, right } = this.webgl.geometries;

		const res = 1024;
		const width = 2.6;
		const height = 4.0497;

		const rightPlane = new Reflector({
			resolution: res,
			width,
			height,
		});
		this.add(rightPlane);
		rightPlane.base.position.copy(right.position);

		const leftPlane = new Reflector({
			resolution: res,
			width,
			height,
		});
		this.add(leftPlane);
		leftPlane.base.position.copy(left.position);
		leftPlane.base.rotateY(Math.PI);

		const topPlane = new Reflector({
			resolution: res,
			width: 2.6,
			height: 8.62,
		});
		this.add(topPlane);
		topPlane.base.position.copy(top.position);
		topPlane.base.rotateX(-Math.PI / 2);
		topPlane.base.rotateY(Math.PI);

		mirrors.push(rightPlane, leftPlane, topPlane);

		return mirrors;
	}

	createGroundReflector() {
		const reflector = new Reflector({
			resolution: 1024,
			width: 24,
			height: 24,
			mirror: 0.05,
			ground: true,
		});

		this.add(reflector);
		reflector.base.rotateX(-Math.PI / 2);

		return reflector;
	}

	render() {
		this.banc.material = this.overrideMaterial;
		const cam = this.scene.getCurrentCamera().cam;
		const scene = this.webgl.scene.base;

		this.mirrors.forEach((el) => {
			el.render(this.webgl.threeRenderer, scene, cam);
		});

		this.groundReflector.render(this.webgl.threeRenderer, scene, cam);

		this.updateMaterial();
	}

	updateMaterial() {
		// this.banc.material = this.bancMaterial;
		// this.banc.material.uniforms.tMap.value =
		// 	this.groundReflector.renderTarget.texture;
		// this.banc.material.uniforms.textureMatrix.value =
		// 	this.groundReflector.textureMatrix;
	}
}
