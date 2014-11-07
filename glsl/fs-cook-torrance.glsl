varying mediump vec4 vColor;

varying mediump vec3 l;
varying mediump vec3 h;
varying mediump vec3 v;
varying mediump vec3 n;

varying mediump vec3 vLighting;

void main (void)
{
    const mediump float roughnessVal = 0.15;
    const mediump vec3 diffColor = vec3(1.0, 0.5, 0.5);
    const mediump vec3 specColor = vec3(0.7, 0.7, 0.0);

    mediump vec3 n2 = normalize(n);
    mediump vec3 l2 = normalize(l);
    mediump vec3 v2 = normalize(v);
    mediump vec3 h2 = normalize(h);

    mediump float cosNL = max(dot(n2, l2), 0.0);
    mediump float cosNV = max(dot(n2, v2), 0.0);
    mediump float cosNH = max(dot(n2, h2), 1.0e-7);
    mediump float cosVH = max(dot(v2, h2), 0.0);

    mediump float geometric = 2.0 * cosNH/ cosVH;
    geometric = min(1.0, geometric * min(cosNV, cosNL));

    mediump float roughness2 = roughnessVal * roughnessVal;
    mediump float cosNH2 = cosNH * cosNH;
    mediump float cosNH2r = 1.0 / (cosNH2 * roughness2);
    mediump float roughnessE = (cosNH2 - 1.0) * cosNH2r;
    mediump float roughness = exp(roughnessE) * cosNH2r / (4.0 * cosNH2);
    mediump float fresnel = 1.0 / (1.0 + cosNV);

    mediump float Rs = min(1.0, (fresnel * geometric * roughness) / (cosNV * cosNL + 1.0e-7));

    gl_FragColor = vec4(vColor.xyz * cosNL * (diffColor + specColor * Rs), 1.0);
}