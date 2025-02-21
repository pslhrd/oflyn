precision highp float;

uniform sampler2D tMap;
varying vec2 vUv;
varying vec4 floorUV;
varying vec3 vNormal;

void main() {
	vec2 uv = floorUV.xy / floorUV.w;
	vec3 diffuse = texture2D(tMap, uv).rgb;
	// diffuse *= vNormal.y;
	// diffuse *= 0.05;
	gl_FragColor = vec4(diffuse, 1.0);
}
