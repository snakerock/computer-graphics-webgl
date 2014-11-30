precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;
varying vec3 l;
varying vec3 n;
varying vec3 vLighting;
varying vec4 ShadowCoord;

vec4 getVisibility(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    vec4 vsm = texture2D(uShadowMap, depth.xy);
    float mu = vsm.x;
    float s2 = vsm.y - mu*mu;
    s2 = max(s2, 0.002);
    float pmax = s2 / ( s2 + (depth.z - mu)*(depth.z - mu) );

    //return vec4(texture2D(uShadowMap, depth.xy).rgb, 1.0);
    //return depth.z * 0.98 < vsm.x ? vec4(1.0) : vec4(vec3(0.3), 1.0);
    return depth.z < vsm.x ? vec4(1.0) : vec4(vec3(pmax), 1.0);
}

void main (void)
{
    vec3 n2 = normalize(n);
    vec3 l2 = normalize(l);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec4 visibility = getVisibility();

    vec4 color = vec4(vColor.xyz * lightColor * max(dot(n2, l2), 0.0), 1.0);
    gl_FragColor = visibility * color;
}