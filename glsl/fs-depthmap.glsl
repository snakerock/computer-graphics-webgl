precision highp float;

void main(){
    float z = gl_FragCoord.z;
    gl_FragColor = vec4(z, z*z, z, 1.0);
}