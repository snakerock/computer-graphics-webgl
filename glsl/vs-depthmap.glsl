precision highp float;

attribute vec3 aVertexPosition;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

void main(){
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}