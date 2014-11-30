precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;
varying vec4 ShadowCoord;

vec4 getVisibility(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    vec4 vsm = texture2D(uShadowMap, depth.xy);
    float mu = vsm.x;
    float s2 = vsm.y - mu*mu;
    float pmax = s2 / ( s2 + (depth.z - mu)*(depth.z - mu) );

    return depth.z < vsm.x ? vec4(1.0) : vec4(vec3(pmax), 1.0);
}

void main(void) {
    vec4 visibility = getVisibility();
	gl_FragColor = vec4((visibility * vColor).rgb, 1.0);//vec4(texture2D(uShadowMap, depth.xy).rgb / 4.0, 1.0);//vec4(depth.xy, 0.0, 1.0);
}