precision highp float;

uniform sampler2D uShadowMap;
uniform vec4 uEyePosition;
uniform float uFogDepth;

varying vec4 vColor;
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
    pmax = ReduceLightBleeding(pmax, 0.6);

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

void main(void) {
    vec3 visibility = getVisibility();
	gl_FragColor = vec4(getFogVisibility() + visibility * vColor.rgb, 1.0);
}