precision highp float;

uniform sampler2D uShadowMap;
uniform vec4 uEyePosition;
uniform vec3 uLightColor;
uniform vec3 uLightSpecColor;
uniform vec3 uLightAmbientColor;
uniform float uFogDepth;

varying vec4 vColor;

varying vec3 l;
varying vec3 h;
varying vec3 v;
varying vec3 n;

varying vec3 vLighting;
varying vec4 ShadowCoord;
varying vec4 vCoord;

float ReduceLightBleeding(float p_max, float Amount)
{
  // Remove the [0, Amount] tail and linearly rescale (Amount, 1].
   return clamp((p_max - Amount) / (1.0 - Amount), 0.0, 1.0);
}

vec3 getVisibility(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    if (depth.x < 0.0 || depth.x > 1.0 || depth.y < 0.0 || depth.y > 1.0) {
        return vec3(1.0);
    }
    vec4 vsm = texture2D(uShadowMap, depth.xy);
    float mu = vsm.x;
    float s2 = vsm.y - mu*mu;
    s2 = max(s2, 0.005);
    float pmax = s2 / ( s2 + (depth.z - mu)*(depth.z - mu) );
    pmax = ReduceLightBleeding(pmax, 0.3);

    return depth.z - 0.01 < vsm.x ? vec3(1.0) : vec3(pmax);
}

vec3 getFogVisibility(void) {

    if (vCoord.y > uFogDepth && uEyePosition.y > uFogDepth || uFogDepth < 0.0) {
        return vec3(0.0);
    }
    vec4 lVector = vCoord - uEyePosition;
    vec4 v = vCoord.y <= uFogDepth ? vCoord : vCoord + (uFogDepth - vCoord.y) / lVector.y * lVector;
    vec4 eye = uEyePosition.y <= uFogDepth ? uEyePosition : uEyePosition + (uFogDepth - uEyePosition.y) / lVector.y * lVector;
    lVector = v - eye;
    float l = length(lVector);
    float sinAlpha = lVector.y / l;
    float visibility = 1.0 - (eye.y + l * sinAlpha / 2.0) / (l / 2.0);
    visibility = max(visibility, 0.0);

    return vec3(visibility);
}

void main (void)
{
    float roughnessVal = 0.15;
    vec3 diffColor = uLightColor;
    vec3 specColor = uLightSpecColor;

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

    vec3 visibility = getVisibility();
    vec3 color = vColor.rgb * cosNL * (uLightColor + uLightSpecColor * Rs);

    gl_FragColor = vec4(getFogVisibility() + uLightAmbientColor + visibility * color, 1.0);
}