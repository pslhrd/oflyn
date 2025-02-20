import createWebGL from './webgl';
import { signal } from './utils/signal';

let instancied = false;
let instance = {};

const NOOP = (v) => v;
const ucfirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export function getWebGL() {
	return instance;
}

export function initWebGL(opts = {}) {
	if (instancied) return instance;
	instancied = true;

	// Global WebGL Hooks
	const hooks = [
		'Init',
		'Preload',
		'Load',
		'Start',
		'Frame',
		'Update',
		'Render',
	].reduce(
		(p, v) => (
			(p['before' + v] = signal()), (p['after' + v] = signal()), p
		),
		{},
	);

	const options = opts;

	// WebGL Plugins
	const plugins = [];

	// WebGL States
	const states = {};

	// WebGL Public API
	let api = {
		init: NOOP,
		preload: NOOP,
		start: NOOP,
		update: NOOP,
		render: NOOP,
		prerender: () => instance.frame(),
		frame: () => {
			instance.update(), instance.render();
		},
		options,
		plugins,
		hooks,
		states,
		usePlugins,
	};

	// Add proper functions & plugins to API
	createWebGL(api);

	api.canvas = options.canvas;

	// Wrap Signals
	wrapFunction('init', true, true, () => {
		installPlugins(plugins);
		// Wrap functions to add hooks
		['frame', 'update', 'render'].forEach((v) => wrapFunction(v, false));
		['preload', 'start'].forEach((v) => wrapFunction(v, true, true));
		['load'].forEach((v) => wrapFunction(v, true));
	});

	instance = api;

	return api;

	function usePlugins(arr) {
		arr.forEach((p) => plugins.push(p));
	}

	function installPlugins(plugins) {
		if (!Array.isArray(plugins)) plugins = [plugins];
		plugins.forEach((p) => typeof p === 'function' && p(api));
	}

	function wrapFunction(name, useAsync, once, pre, post) {
		const fn = api[name] || NOOP;
		const hookSuffix = ucfirst(name);
		const before = hooks['before' + hookSuffix] || NOOP;
		const after = hooks['after' + hookSuffix] || NOOP;
		api[name] = useAsync
			? async function (opts) {
					before.emit();
					if (pre) pre();
					await fn(opts);
					if (post) post();
					after.emit();
					if (once) {
						before.unwatchAll();
						after.unwatchAll();
					}
				}
			: function (opts) {
					before.emit();
					if (pre) pre();
					fn(opts);
					if (post) post();
					after.emit();
					if (once) {
						before.unwatchAll();
						after.unwatchAll();
					}
				};
	}
}
