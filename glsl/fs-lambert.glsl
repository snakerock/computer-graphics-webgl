varying mediump vec4 vColor;

varying mediump vec3 l;
varying mediump vec3 n;

varying mediump vec3 vLighting;

void main (void)
{
    mediump vec3 n2 = normalize(n);
    mediump vec3 l2 = normalize(l);
    mediump vec3 lightColor = vec3(1.0, 0.5, 0.5);
    mediump vec4 color = vec4(vColor.xyz * lightColor * max(dot(n2, l2), 0.0), 1.0);

    gl_FragColor = color;
}