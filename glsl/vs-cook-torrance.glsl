attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

varying mediump vec4 vColor;
varying mediump vec3 l;
varying mediump vec3 h;
varying mediump vec3 v;
varying mediump vec3 n;

uniform vec4 uLightPosition;
uniform vec4 uEyePosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

void main(void)
{
    mediump vec4 p4 = uMVMatrix * vec4(aVertexPosition, 1.0);
    mediump vec3 p3 = vec3(p4);

    l = normalize(vec3(uMVMatrix * uLightPosition - p4));
    n = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    v = normalize(vec3(uEyePosition - p4));
    h = normalize(l + v);
    vColor = vec4(aVertexColor, 1.0);

    gl_Position = uPMatrix * p4;
}