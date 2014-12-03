precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

varying vec4 vColor;
varying vec4 ShadowCoord;
varying vec3 l;
varying vec3 h;
varying vec3 v;
varying vec3 n;

uniform vec4 uLightPosition;
uniform vec4 uEyePosition;
uniform mat4 uDepthBiasMVP;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

void main(void)
{
    vec4 p4 = uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    vec3 p3 = vec3(p4);

    l = normalize(vec3(uVMatrix * uLightPosition - p4));
    n = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    v = normalize(vec3(uEyePosition - p4));
    h = normalize(l + v);
    vColor = vec4(aVertexColor, 1.0);

    gl_Position = uPMatrix * p4;
	ShadowCoord = uDepthBiasMVP * vec4(aVertexPosition, 1.0);
}