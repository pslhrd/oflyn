uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
	vPosition = position;
	vNormal = normalize(normalMatrix * normal);
	vUv = textureMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
