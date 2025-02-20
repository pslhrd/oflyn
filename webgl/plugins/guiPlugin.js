import { Pane } from 'tweakpane';

export default function guiPlugin(webgl) {
	let container, dom;
	let DEBUG = true;

	if (!DEBUG) return;
	container = document.createElement('div');
	const pane = new Pane({ container });

	dom = document.createElement('div');
	dom.classList.add('debug-gui');
	dom.appendChild(pane.containerElem_);
	const app = document.querySelector('#app');
	app.appendChild(dom);

	webgl.gui = pane;
}
