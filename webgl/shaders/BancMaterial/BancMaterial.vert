precision highp float;
uniform mat4 textureMatrix;

varying vec2 vUv;
varying vec4 floorUV;
varying vec3 vNormal;
void main() {
	floorUV = vec4(1.0);
	vUv = uv;
	vNormal = normal;
	// UGLY AF
	vec3 transformed = position;
	transformed.x *= 0.5;
	transformed.y *= 0.5;
	transformed.z *= 0.5;
	floorUV = textureMatrix * vec4(transformed, 1.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
