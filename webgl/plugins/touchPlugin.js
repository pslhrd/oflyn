import { Vector2 } from 'three';
import { map } from '../utils/maths';
import gsap from 'gsap';
import { Signal } from '../utils/signal';

export default function touchPlugin(webgl) {
	const _vec2 = new Vector2();
	let needsUpdate = false;

	const api = {
		pressed: false,
		pos: new Vector2(0, 0),
		delta: new Vector2(),
		normalizePos: new Vector2(),
		dragDelta: new Vector2(),
		started: false,
	};

	const state = {
		pressed: false,
		pos: new Vector2(),
		delta: new Vector2(),
		normalizePos: new Vector2(),
		firstPos: new Vector2(),
		prevPos: new Vector2(),
	};

	webgl.hooks.click = new Signal();

	async function init() {
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mousedown', onStart);
		window.addEventListener('mouseup', onEnd);
		window.addEventListener('touchstart', onTouchStart);
		window.addEventListener('touchmove', onTouchMove);
		window.addEventListener('touchend', onTouchEnd);
		gsap.ticker.add(update);
	}

	function onStart(e) {
		state.delta.set(0, 0);
		state.firstPos.set(e.clientX, e.clientY);
		state.prevPos.copy(state.firstPos);
		state.pos.copy(state.firstPos);
		state.pressed = true;

		webgl.hooks.click.emit();

		needsUpdate = true;
	}

	function onTouchStart(e) {
		state.delta.set(0, 0);
		state.firstPos.set(
			e.changedTouches[0].clientX || 0,
			e.changedTouches[0].clientY || 0,
		);
		state.prevPos.copy(state.firstPos);
		state.pos.copy(state.firstPos);
		state.pressed = true;
		needsUpdate = true;
	}

	function onTouchMove(e) {
		api.started = true;
		state.pos.set(
			e.changedTouches[0].clientX || 0,
			e.changedTouches[0].clientY || 0,
		);
	}

	function onTouchEnd(e) {
		state.pos.set(
			e.changedTouches[0].clientX || 0,
			e.changedTouches[0].clientY || 0,
		);
		state.pressed = false;
		needsUpdate = true;
	}

	function onEnd(e) {
		state.pos.set(e.clientX, e.clientY);
		state.pressed = false;
		needsUpdate = true;
	}

	function onMove(e) {
		api.started = true;
		state.pos.set(e.clientX, e.clientY);
	}

	function update() {
		state.delta.copy(state.pos).sub(state.prevPos);
		state.prevPos.copy(state.pos);

		const prevDelta = api.delta;
		if (!needsUpdate)
			needsUpdate = !state.delta.equals(prevDelta) || state.delta !== 0;
		if (needsUpdate) updateStore();
		needsUpdate = false;
	}

	function updateStore() {
		api.pressed = state.pressed;
		api.pos.copy(state.pos);
		api.delta.copy(state.delta);
		const size = { x: webgl.viewport.width, y: webgl.viewport.height };
		api.normalizePos.set(
			map(state.pos.x, 0, size.x, -1, 1),
			map(state.pos.y, 0, size.y, 1, -1),
		);
		if (!api.started) api.normalizePos.set(0, 0);
	}

	init();

	webgl.touch = api;
}
