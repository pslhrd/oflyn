const PI2 = Math.PI * 2;

// --- smoothstep ---
export function smoothstep(min, max, value) {
	const x = clamp((value - min) / (max - min), 0, 1);
	return x * x * (3 - 2 * x);
}

// ------ map -------
export function clamp(value, min = 0, max = 1) {
	return Math.min(Math.max(value, min), max);
}
export function map(value, start1, stop1, start2, stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
export function clampedMap(value, start1, stop1, start2, stop2) {
	const v = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
	return Math.max(start2, Math.min(stop2, v));
}
export function norm(value, min = 0, max = 1) {
	return (value - min) / (max - min);
}
export function clampedNorm(value, min = 0, max = 1) {
	return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

// ------ lerp -------
export const mix = lerp;
export const mixPrecise = lerpPrecise;
export function lerp(start, end, t) {
	return start * (1 - t) + end * t;
}
export function lerpPrecise(start, end, t, limit = 0.001) {
	const v = start * (1 - t) + end * t;
	return Math.abs(end - v) < limit ? end : v;
}
export function damp(a, b, smoothing, dt) {
	return lerp(a, b, 1 - Math.exp(-smoothing * 0.05 * dt));
}
export function dampPrecise(a, b, smoothing, dt, limit) {
	return lerpPrecise(a, b, 1 - Math.exp(-smoothing * 0.05 * dt), limit);
}
function shortAngleDist(a0, a1) {
	let da = (a1 - a0) % PI2;
	return ((2 * da) % PI2) - da;
}
export function lerpAngle(a0, a1, t) {
	return a0 + shortAngleDist(a0, a1) * t;
}
