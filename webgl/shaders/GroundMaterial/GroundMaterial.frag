uniform sampler2D tDiffuse;
uniform sampler2D tBlurred;
uniform sampler2D tDepth;
uniform sampler2D tBake;
uniform sampler2D tNormal;

uniform float mirror;
varying vec4 vUv;

varying vec2 meshUV;

float blendSoftLight(float base, float blend) {
	return blend < 0.5
		? 2.0 * base * blend + base * base * (1.0 - 2.0 * blend)
		: sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(
		blendSoftLight(base.r, blend.r),
		blendSoftLight(base.g, blend.g),
		blendSoftLight(base.b, blend.b)
	);
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return blendSoftLight(base, blend) * opacity + base * (1.0 - opacity);
}

void main() {
	vec2 uv = vUv.xy / vUv.w;
	vec4 reflectorColor = texture2D(tDiffuse, uv);

	vec3 bake = texture2D(tBake, meshUV).rgb;

	// NORMAL
	vec2 normal_uv = vec2(0.0);
	vec3 normalColor = texture2D(tNormal, meshUV * 10.0).rgb;
	vec3 normal = normalize(
		vec3(
			normalColor.r * 2.0 - 1.0,
			normalColor.b,
			normalColor.g * 2.0 - 1.0
		)
	);

	vec3 coord = vUv.xyz / vUv.w;
	normal_uv = coord.xy + coord.z * normal.xz * 0.065;

	vec4 diffuse = texture2D(tDiffuse, normal_uv);
	vec4 blur = texture2D(tBlurred, normal_uv);

	vec3 outputColor = blur.rgb * 0.15;

	outputColor *= bake;

	gl_FragColor = vec4(reflectorColor.rgb * mirror, 1.0);
	gl_FragColor.rgb = outputColor;
}
