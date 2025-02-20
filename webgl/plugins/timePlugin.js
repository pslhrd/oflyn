import gsap from 'gsap';
import {
	clamp,
	clampedMap,
	clampedNorm,
	createMovingAverage,
	lerp,
} from '../utils/maths';

const MAXFRAME = Number.MAX_SAFE_INTEGER;

const stableIntervals = [30, 60, 120, 144, 240].map((target) => {
	const delta = 0.75;
	target = 1000 / target;
	return [target + delta, target, target - delta];
});

export default function timePlugin(webgl) {
	const averageDt = createMovingAverage(20);
	const averageStableDt = createMovingAverage(6);
	let needsReset = false;
	let now = performance.now();

	// Variables used when using clampFps
	const clampDtAverage = createMovingAverage(20);
	let clampDtFramesAccum = 0;
	let clampDtAccum = 0;
	let clampSkippedAccum = 0;

	webgl.hooks.afterFrame.watchOnce(() => {
		needsReset = true;
	});

	const api = {
		dt: 0, // Raw, pure delta time

		clampedDt: 0, // Avoid large delta time on big freeze
		averageDt: 16.6667, // Average delta time
		stableDt: 16.6667, // From averageDt, try to "fix it" to known stables frame rates

		elapsed: 0, // Time elapsed since start
		pausedElapsed: 0, // Time elapsed, minus paused time

		frameNum: 0, // Frame number since start
		isPaused: true,
		isStarted: true,

		clampFps: 60, // Limit to X fps
		set clampTo60Fps(v) {
			api.clampFps = v ? 60 : 0;
		},

		init,
		start,
		stop,
		resume,
		pause,

		customLoop: null, // Plug a custom tick method instead of RAF
	};

	function init() {
		if (api.customLoop) api.customLoop(frame);
		else gsap.ticker.add(frame);
		api.isStarted = true;
		api.isPaused = false;
	}

	function resume() {
		api.isPaused = false;
	}

	function pause() {
		api.isPaused = true;
	}

	function start() {
		api.isStarted = true;
	}

	function stop() {
		api.isStarted = false;
	}

	function frame(dt) {
		const prev = now;
		now = performance.now();
		dt = now - prev;

		if (dt === 0) dt = 16.6667;

		if (needsReset) {
			needsReset = false;
			dt = 16.6667;
			averageDt.reset();
			averageStableDt.reset();
			clampDtAccum = clampDtFramesAccum = clampSkippedAccum = 0;
			clampDtAverage.reset();
		}

		// Clamp fps
		if (api.clampFps > 0) {
			// Progressively add the dt "missing" to get the target fps
			// When the accumulation reach the target frame duration, we skip a frame
			const clampDt = clampDtAverage.push(dt);
			const target = 1000 / api.clampFps;
			const delta = Math.max(0, target - clampDt);
			clampDtAccum += delta;
			if (clampDtAccum >= target) {
				clampDtFramesAccum = 0;
				clampDtAccum = Math.max(0, clampDtAccum - target);
				clampSkippedAccum += dt;
				return;
			}

			// Too much frames skipped, current deltas will not justify a frame skip
			// We just reset the accumulator, to avoid a futur frame skip
			// due to the imprecision in performance.now() in some browsers
			if (clampDtFramesAccum >= 10) {
				clampDtAccum = clampDtFramesAccum = 0;
			} else {
				clampDtFramesAccum += 1;
			}

			dt += clampSkippedAccum;
			clampSkippedAccum = 0;
		}

		api.clampedDt = clamp(dt === undefined ? 16.6667 : dt, 1, 130);
		api.averageDt = averageDt.push(dt);

		let tsdt = api.averageDt;
		for (let i = 0, l = stableIntervals.length; i < l; i++) {
			const interval = stableIntervals[i];
			if (tsdt >= interval[2]) {
				if (tsdt <= interval[0]) tsdt = interval[1];
				break;
			}
		}

		api.stableDt = averageStableDt.push(tsdt);
		api.dt = dt;
		api.frameNum = (api.frameNum + 1) % MAXFRAME;
		api.elapsed += dt;

		if (!api.isStarted) return;
		if (!api.isPaused) api.pausedElapsed += dt;
		webgl.frame();
	}

	webgl.time = api;
}
