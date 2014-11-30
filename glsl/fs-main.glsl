precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;
varying vec4 ShadowCoord;

void main(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    float shadowValue = texture2D(uShadowMap, depth.xy).r;
    float visibility = depth.z * 0.9999 < shadowValue ? 1.0 : 0.3;
	gl_FragColor = vec4((visibility * vColor).rgb, 1.0);//vec4(texture2D(uShadowMap, depth.xy).rgb / 4.0, 1.0);//vec4(depth.xy, 0.0, 1.0);
}