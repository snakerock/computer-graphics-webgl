precision highp float;

uniform sampler2D uShadowMap;
uniform vec4 uEyePosition;
uniform float uFogDepth;

varying vec4 vColor;
varying vec3 l;
varying vec3 n;
varying vec3 vLighting;
varying vec4 ShadowCoord;
varying vec4 vCoord;

vec4 getVisibility(void) {
    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    vec4 vsm = texture2D(uShadowMap, depth.xy);
    float mu = vsm.x;
    float s2 = vsm.y - mu*mu;
    s2 = max(s2, 0.005);
    float pmax = s2 / ( s2 + (depth.z - mu)*(depth.z - mu) );

    return depth.z < vsm.x ? vec4(1.0) : vec4(vec3(pmax), 1.0);
}

vec4 getFogVisibility(void) {

    if (vCoord.y > uFogDepth && uEyePosition.y > uFogDepth || uFogDepth < 0.0) {
        return vec4(vec3(0.0), 1.0);
    }
    vec4 lVector = vCoord - uEyePosition;
    vec4 v = vCoord.y <= uFogDepth ? vCoord : vCoord + (uFogDepth - vCoord.y) / lVector.y * lVector;
    vec4 eye = uEyePosition.y <= uFogDepth ? uEyePosition : uEyePosition + (uFogDepth - uEyePosition.y) / lVector.y * lVector;
    lVector = v - eye;
    float l = length(lVector);
    float sinAlpha = lVector.y / l;
    float visibility = 1.0 - (eye.y / uFogDepth + l * sinAlpha / (2.0 * uFogDepth));
    if (visibility < 0.0) {
        visibility = 0.0;
    }
    return vec4(vec3(visibility), 1.0);
}

void main (void)
{
    vec3 n2 = normalize(n);
    vec3 l2 = normalize(l);
    vec3 lightColor = vec3(1.0, 0.5, 0.5);

    vec4 visibility = getVisibility();

    vec4 color = vec4(vColor.xyz * lightColor * max(dot(n2, l2), 0.0), 1.0);
    gl_FragColor = vec4(getFogVisibility().rgb + visibility.rgb * color.rgb, 1.0);
}