precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexColor;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uDepthBiasMVP;

varying vec4 vColor;
varying vec4 ShadowCoord;
varying vec4 vCoord;

void main(void) {
    vColor = vec4(aVertexColor, 1.0);
    vCoord = uMMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * uVMatrix * vCoord;

	ShadowCoord = uDepthBiasMVP * vec4(aVertexPosition, 1.0);
}