precision highp float;

uniform highp sampler2D inputBuffer;
uniform mediump float blurStrength;

uniform vec4 resolution;

const float PI2 = 6.28318530718;
const float BLUR_SAMPLES = 10.0;

vec4 blur(sampler2D image, vec2 uv) {
	vec4 color = texture2D(image, uv);
	for (float d = 0.0; d < PI2; d += PI2 / BLUR_SAMPLES) {
		color += texture2D(image, uv + vec2(cos(d), sin(d)) * blurStrength);
	}
	color /= BLUR_SAMPLES * 1.095;
	return color;
}

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
	vec4 color = vec4(0.0);
	vec2 off1 = vec2(1.3333333333333333) * direction;
	color += texture2D(image, uv) * 0.29411764705882354;
	color += texture2D(image, uv + off1 / resolution) * 0.35294117647058826;
	color += texture2D(image, uv - off1 / resolution) * 0.35294117647058826;
	return color;
}

varying vec2 vUv;
// varying vec2 vUv1;
// varying vec2 vUv2;
// varying vec2 vUv3;

void main() {
	vec4 sum = blur(inputBuffer, vUv); // Top left

	gl_FragColor = sum;
	// gl_FragColor.rgb = vec3(test.a);
	// gl_FragColor.a = 1.;
}
