import {
	Plane,
	Vector3,
	Vector4,
	Matrix4,
	PerspectiveCamera,
	RGBFormat,
	Mesh,
	LinearFilter,
	WebGLRenderTarget,
	DepthTexture,
	DepthFormat,
	UnsignedShortType,
	Object3D,
	PlaneGeometry,
} from 'three';

import { BaseComponent } from '../core/BaseComponent';
import { ReflectorMaterial } from '../shaders/ReflectorMaterial/ReflectorMaterial';
import { GroundMaterial } from '../shaders/GroundMaterial/GroundMaterial';

import createBlurPass from './BlurPass/BlurPass';

export default class Reflector extends BaseComponent {
	constructor({
		resolution = 256,
		mirror = 0.9,
		width = 1,
		height = 1,
		geometry = null,
		mesh = null,
		ground = false,
	} = {}) {
		super();
		this.config = {
			resolution,
			mirror,
			width,
			height,
			geometry,
			mesh,
			ground,
		};
	}

	init() {
		this.base = new Object3D();

		// Initialize vectors and matrices
		this.reflectorPlane = new Plane();
		this.normal = new Vector3();
		this.reflectorWorldPosition = new Vector3();
		this.cameraWorldPosition = new Vector3();
		this.rotationMatrix = new Matrix4();
		this.lookAtPosition = new Vector3(0, 0, -1);
		this.clipPlane = new Vector4();
		this.view = new Vector3();
		this.target = new Vector3();
		this.q = new Vector4();
		this.textureMatrix = new Matrix4();
		this.virtualCamera = new PerspectiveCamera();

		// Handle custom mesh or create default plane
		if (this.config.mesh) {
			this.mesh = this.config.mesh;
			this.geo = this.mesh.geometry;
			this.originalMaterial = this.mesh.material;
		} else {
			this.geo =
				this.config.geometry ||
				new PlaneGeometry(this.config.width, this.config.height);
			this.mesh = new Mesh(this.geo);
		}

		// Setup render targets
		this.setupRenderTargets();

		// Setup and apply material
		this.material = this.config.ground
			? new GroundMaterial()
			: new ReflectorMaterial();

		this.material.uniforms.mirror.value = this.config.mirror;
		this.material.uniforms.textureMatrix.value = this.textureMatrix;
		this.material.uniforms.tDiffuse.value = this.renderTarget.texture;

		if (this.config.ground) {
			this.blurPass = createBlurPass(this.webgl);
		}

		this.mesh.material = this.material;

		if (!this.config.mesh) {
			this.base.add(this.mesh);
		}
	}

	setupRenderTargets() {
		const parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat,
			encoding: this.renderer ? this.renderer.outputEncoding : null,
		};

		this.renderTarget = new WebGLRenderTarget(
			this.config.resolution,
			this.config.resolution,
			parameters,
		);
		this.renderTarget.depthBuffer = true;
		this.renderTarget.depthTexture = new DepthTexture(
			this.config.resolution,
			this.config.resolution,
		);
		this.renderTarget.depthTexture.format = DepthFormat;
		this.renderTarget.depthTexture.type = UnsignedShortType;
	}

	beforeRender(camera, scene) {
		if (!this.mesh) return;

		this.reflectorWorldPosition.setFromMatrixPosition(
			this.mesh.matrixWorld,
		);
		this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
		this.rotationMatrix.extractRotation(this.mesh.matrixWorld);

		this.normal.set(0, 0, 1);
		this.normal.applyMatrix4(this.rotationMatrix);

		this.view.subVectors(
			this.reflectorWorldPosition,
			this.cameraWorldPosition,
		);

		// Avoid rendering when reflector is facing away
		if (this.view.dot(this.normal) > 0) return;

		this.view.reflect(this.normal).negate();
		this.view.add(this.reflectorWorldPosition);

		this.rotationMatrix.extractRotation(camera.matrixWorld);
		this.lookAtPosition.set(0, 0, -1);
		this.lookAtPosition.applyMatrix4(this.rotationMatrix);
		this.lookAtPosition.add(this.cameraWorldPosition);

		this.target.subVectors(
			this.reflectorWorldPosition,
			this.lookAtPosition,
		);
		this.target.reflect(this.normal).negate();
		this.target.add(this.reflectorWorldPosition);

		this.virtualCamera.position.copy(this.view);
		this.virtualCamera.up.set(0, 1, 0);
		this.virtualCamera.up.applyMatrix4(this.rotationMatrix);
		this.virtualCamera.up.reflect(this.normal);
		this.virtualCamera.lookAt(this.target);
		this.virtualCamera.far = camera.far;
		this.virtualCamera.updateMatrixWorld();
		this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

		// Update the texture matrix
		this.textureMatrix.set(
			0.5,
			0.0,
			0.0,
			0.5,
			0.0,
			0.5,
			0.0,
			0.5,
			0.0,
			0.0,
			0.5,
			0.5,
			0.0,
			0.0,
			0.0,
			1.0,
		);

		this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
		this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
		this.textureMatrix.multiply(this.mesh.matrixWorld);

		// Update projection matrix with new clip plane
		this.reflectorPlane.setFromNormalAndCoplanarPoint(
			this.normal,
			this.reflectorWorldPosition,
		);
		this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);
		this.clipPlane.set(
			this.reflectorPlane.normal.x,
			this.reflectorPlane.normal.y,
			this.reflectorPlane.normal.z,
			this.reflectorPlane.constant,
		);

		const projectionMatrix = this.virtualCamera.projectionMatrix;
		this.q.x =
			(Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
			projectionMatrix.elements[0];
		this.q.y =
			(Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
			projectionMatrix.elements[5];
		this.q.z = -1.0;
		this.q.w =
			(1.0 + projectionMatrix.elements[10]) /
			projectionMatrix.elements[14];

		this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

		projectionMatrix.elements[2] = this.clipPlane.x;
		projectionMatrix.elements[6] = this.clipPlane.y;
		projectionMatrix.elements[10] = this.clipPlane.z + 1.0;
		projectionMatrix.elements[14] = this.clipPlane.w;
	}

	render(renderer, scene, camera) {
		if (!this.mesh) return;

		this.mesh.visible = false;
		this.beforeRender(camera, scene);

		// Render first pass to renderTarget
		renderer.setRenderTarget(this.renderTarget);
		renderer.clear();
		renderer.render(scene, this.virtualCamera);

		// Apply blur if enabled
		if (this.config.ground) {
			const blurredTexture = this.blurPass.render(this.renderTarget);
			this.material.uniforms.tBlurred.value = blurredTexture;

			this.webgl.reflectorTexture = this.renderTarget.texture;
		}

		this.mesh.visible = true;
		renderer.setRenderTarget(null);
	}

	dispose() {
		if (!this.config.mesh && !this.config.geometry) {
			this.geo.dispose();
		}

		if (this.originalMaterial) {
			this.mesh.material = this.originalMaterial;
		}

		if (this.blurPass) {
			this.blurPass.dispose();
		}

		ReflectorMaterial.unuse();
		this.renderTarget.dispose();
		if (this.renderTargetBlur) {
			this.renderTargetBlur.dispose();
		}
	}
}
