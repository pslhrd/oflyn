import { initWebGL } from './webgl';

let canvas, webgl;

// Create Canvas
canvas = document.createElement('canvas');
canvas.classList.add('webgl');
const app = document.querySelector('#app');
app.appendChild(canvas);

// Init GL
webgl = initWebGL({ canvas });

async function onMounted() {
	await webgl.init();
	await webgl.preload();
	await webgl.start();
}

window.addEventListener('DOMContentLoaded', onMounted);
