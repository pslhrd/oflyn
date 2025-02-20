import { getWebGL } from '..';

const StringType = 'string';

export class BaseComponent {
	constructor(props = {}) {
		this.isComponent = true;
		this.props = props;

		this.webgl = getWebGL();
		this.scene = null;
		this.parent = null;
		this.base = null;

		const c = (this.children = []);
	}

	triggerInit() {
		if (this.isInit) return;
		if (this.beforeInit) this.beforeInit();
		if (this.init) this.init();

		// Debug Functions
		if (this.webgl.gui && this.debug) this.debug();

		this.isInit = true;
		if (this.afterInit) this.afterInit();
	}

	addObject3D(object) {
		if (this.base) this.base.add(object);
		return object;
	}

	removeObject3D(object) {
		if (this.base) this.base.remove(object);
		return null;
	}

	add(child, props = {}, mountTo) {
		if (typeof child === StringType) {
			child = this.webgl.components[child];
		}
		if (!child) return;
		if (~this.children.indexOf(child)) return child;

		if (!child.isComponent) child = new child(props);
		const currentParent = child.parent;
		if (currentParent) currentParent.remove(child);

		child.parent = this;
		if (this.scene) child.scene = this.scene;
		else if (this.isScene) child.scene = this;
		if (!child.isInit) child.triggerInit(props);

		this.children.push(child);

		if (child.base) {
			if (mountTo) mountTo.add(child.base);
			else if (this.base) this.base.add(child.base);
		}
		if (child.destroyed) {
			this.remove(child);
			return child;
		}
		if (this.isAttached) triggerAttached(this.scene, child);
		return child;
	}

	triggerUpdate() {
		if (!this.isInit) return;
		if (this.beforeUpdate) this.beforeUpdate();
		if (this.update) this.update();
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];
			if (child) child.triggerUpdate();
		}
		if (this.afterUpdate) this.afterUpdate();
	}

	destroy() {
		if (this.isDestroyed) return;

		if (this.beforeDestroy) this.beforeDestroy();
		if (this.parent) this.parent.remove(this);

		// Destroy each children components
		for (let i = this.children.length - 1; i >= 0; i--) {
			this.children[i].destroy();
		}

		// Remove three object
		if (this.base) {
			for (let i = this.base.children.length - 1; i >= 0; i--) {
				this.base.remove(this.base.children[i]);
			}
			this.base.removeFromParent();
		}

		// De-reference variables
		this.props = null;
		this.webgl = null;
		this.scene = null;
		this.parent = null;
		this.base = null;
		this.children = null;
		this.isDestroyed = true;
	}
}
