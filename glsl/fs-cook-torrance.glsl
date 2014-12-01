precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;

varying vec3 l;
varying vec3 h;
varying vec3 v;
varying vec3 n;

varying vec3 vLighting;
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

void main (void)
{
    const float roughnessVal = 0.15;
    const vec3 diffColor = vec3(1.0, 0.5, 0.5);
    const vec3 specColor = vec3(0.7, 0.7, 0.0);

    vec3 n2 = normalize(n);
    vec3 l2 = normalize(l);
    vec3 v2 = normalize(v);
    vec3 h2 = normalize(h);

    float cosNL = max(dot(n2, l2), 0.0);
    float cosNV = max(dot(n2, v2), 0.0);
    float cosNH = max(dot(n2, h2), 1.0e-7);
    float cosVH = max(dot(v2, h2), 0.0);

    float geometric = 2.0 * cosNH/ cosVH;
    geometric = min(1.0, geometric * min(cosNV, cosNL));

    float roughness2 = roughnessVal * roughnessVal;
    float cosNH2 = cosNH * cosNH;
    float cosNH2r = 1.0 / (cosNH2 * roughness2);
    float roughnessE = (cosNH2 - 1.0) * cosNH2r;
    float roughness = exp(roughnessE) * cosNH2r / (4.0 * cosNH2);
    float fresnel = 1.0 / (1.0 + cosNV);

    float Rs = min(1.0, (fresnel * geometric * roughness) / (cosNV * cosNL + 1.0e-7));

    vec4 visibility = getVisibility();
    vec4 color = vec4(vColor.xyz * cosNL * (diffColor + specColor * Rs), 1.0);

    gl_FragColor = visibility * color;
}