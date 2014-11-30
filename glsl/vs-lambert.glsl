precision mediump float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

varying vec4 vColor;
varying vec3 l;
varying vec3 n;
varying vec4 ShadowCoord;

uniform vec4 uLightPosition;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uDepthBiasMVP;

void main(void)
{
    vec4 p4 = uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    vec3 p3 = vec3(p4);

    l = normalize(vec3(uVMatrix * uLightPosition - p4));
    n = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
    vColor = vec4(aVertexColor, 1.0);

    gl_Position = uPMatrix * p4;
	ShadowCoord = uDepthBiasMVP * vec4(aVertexPosition, 1.0);
}