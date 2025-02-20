// Create a big triangle for post-processing purpose
// Ref: https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/

import { BufferGeometry, BufferAttribute } from 'three';

const positions = new Float32Array([-2, 0, 0, -2, 2, 2]);
const bigTriangleGeometry = new BufferGeometry();
bigTriangleGeometry.setAttribute('position', new BufferAttribute(positions, 2));

const bigTriangleVertexShader = [
	`precision highp float;`,
	`attribute vec2 position;`,
	`varying vec2 vUv;`,
	`void main() {`,
	`vUv = position;`,
	`gl_Position =  vec4(2.0 * position - 1.0, 0.,  1);`,
	`}`,
].join('');

export default bigTriangleVertexShader;
export { bigTriangleGeometry, bigTriangleVertexShader };
