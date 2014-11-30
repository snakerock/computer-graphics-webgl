precision mediump float;

uniform sampler2D uShadowMap;

varying vec4 vColor;
varying vec3 l;
varying vec3 n;
varying vec3 vLighting;
varying vec4 ShadowCoord;

void main (void)
{
    vec3 n2 = normalize(n);
    vec3 l2 = normalize(l);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    vec3 depth = ShadowCoord.xyz / ShadowCoord.w;
    float shadowValue = texture2D(uShadowMap, depth.xy).r;
    float visibility = depth.z * 0.9999 < shadowValue ? 1.0 : 0.3;

    vec4 color = vec4(visibility * vColor.xyz * lightColor * max(dot(n2, l2), 0.0), 1.0);
    gl_FragColor = color;
}