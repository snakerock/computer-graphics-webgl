precision mediump float;

//declare uniforms
uniform sampler2D uTexture;
uniform float uResolutionX;
uniform float uResolutionY;
uniform float uRadius;
uniform vec2 uDirection;

void main() {
    //this will be our RGBA sum
    vec4 sum = vec4(0.0);

    //our original texcoord for this fragment
    vec2 tc = vec2(gl_FragCoord.x / uResolutionX, gl_FragCoord.y / uResolutionY);

    //the amount to blur, i.e. how far off center to sample from
    //1.0 -> blur by one pixel
    //2.0 -> blur by two pixels, etc.
    float blurX = uRadius/uResolutionX;
    float blurY = uRadius/uResolutionY;

    //the uDirectionection of our blur
    //(1.0, 0.0) -> x-axis blur
    //(0.0, 1.0) -> y-axis blur
    float hstep = uDirection.x;
    float vstep = uDirection.y;

    //apply blurring, using a 9-tap filter with predefined gaussian weights

    sum += texture2D(uTexture, vec2(tc.x - 4.0*blurX*hstep, tc.y - 4.0*blurY*vstep)) * 0.0162162162;
    sum += texture2D(uTexture, vec2(tc.x - 3.0*blurX*hstep, tc.y - 3.0*blurY*vstep)) * 0.0540540541;
    sum += texture2D(uTexture, vec2(tc.x - 2.0*blurX*hstep, tc.y - 2.0*blurY*vstep)) * 0.1216216216;
    sum += texture2D(uTexture, vec2(tc.x - 1.0*blurX*hstep, tc.y - 1.0*blurY*vstep)) * 0.1945945946;

    sum += texture2D(uTexture, vec2(tc.x, tc.y)) * 0.2270270270;

    sum += texture2D(uTexture, vec2(tc.x + 1.0*blurX*hstep, tc.y + 1.0*blurY*vstep)) * 0.1945945946;
    sum += texture2D(uTexture, vec2(tc.x + 2.0*blurX*hstep, tc.y + 2.0*blurY*vstep)) * 0.1216216216;
    sum += texture2D(uTexture, vec2(tc.x + 3.0*blurX*hstep, tc.y + 3.0*blurY*vstep)) * 0.0540540541;
    sum += texture2D(uTexture, vec2(tc.x + 4.0*blurX*hstep, tc.y + 4.0*blurY*vstep)) * 0.0162162162;

    //discard alpha for our simple demo, multiply by vertex color and return
    gl_FragColor = vec4(sum.rgb, 1.0);
}