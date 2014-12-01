precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;
varying vec4 ShadowCoord;

vec4 getVisibility(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    vec4 vsm = texture2D(uShadowMap, depth.xy);
    float mu = vsm.x;
    float s2 = vsm.y - mu*mu;
    s2 = max(s2, 0.005);
    float pmax = s2 / ( s2 + (depth.z - mu)*(depth.z - mu) );

    return depth.z < vsm.x ? vec4(1.0) : vec4(vec3(pmax), 1.0);
}

void main(void) {
    vec4 visibility = getVisibility();
	gl_FragColor = visibility * vColor;
}