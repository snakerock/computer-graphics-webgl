precision mediump float;

attribute vec2 aVertexPosition;

void main(void) {
    gl_Position = vec4(aVertexPosition.xy * 2.0 - 1.0, 0.0, 1.0);
}