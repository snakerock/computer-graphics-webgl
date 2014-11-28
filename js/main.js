var canvas;
var gl;
var scene;
var isMouseDown = false;
var mousePos = [0, 0];
var depthTextureExt;

    function start() {
    canvas = $("#glcanvas")[0];
    gl = initWebGL(canvas);

    if (gl) {
        gl.clearColor(0.5, 0.5, 0.5, 1.0);                      // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear the color as well as the depth buffer.
        depthTextureExt = gl.getExtension("WEBGL_depth_texture");
        gl.getExtension('OES_texture_float');
    } else {
        alert("Could not initialize WebGL. Update your browser or check settings.");
        return;
    }

    scene = new Scene(canvas, gl);
    /*for (var x = -400.0; x <= 401.0; x += 200.0) {
        for (var z = -300.0; z >= -500.0; z -= 100.0) {
            scene.objects.push (new Object3D(gl,
                                "ozzy-vn.json",
                                new CookTorranceShader(gl),
                                new DepthmapShader(gl),
                                [x, -200, z]));
        }
    }*/
    var nlshader = new NoLightShader(gl);
    var dmshader = new DepthmapShader(gl);
    scene.objects.push(new Object3D(gl, "ozzy.json", nlshader, dmshader, [0.0, -150.0, -300.0]));
    scene.objects.push(new Object3D(gl, "ozzy.json", nlshader, dmshader, [0.0, -200, -500.0]));
    //scene.objects.push(new Object3D(gl, "ozzy-vn.json", new LambertShader(gl), [-200.0, -100, -300.0]));

    $(window).resize(resizeCanvas);
    resizeCanvas();

    $("#glcanvas").mousedown(function (event) {
        isMouseDown = true;
        mousePos = [event.pageX, event.pageY];
    });

    $("#glcanvas").mousemove(function (event) {
        if (isMouseDown) {
            scene.vRotateXY((event.pageX - mousePos[0]) / 100, (event.pageY - mousePos[1]) / 100);
            mousePos = [event.pageX, event.pageY];
            drawScene();
        }
    });

    $("#glcanvas").mouseup(function (event) {
        isMouseDown = false;
    });

    $("#glcanvas").bind('mousewheel', function(event) {
        var z = event.originalEvent.wheelDelta > 0 ? 10 : -10;
        scene.vTranslate(z);
        drawScene();
    });
}

function initWebGL(canvas) {
    gl = null;

    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) { }

    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }

    return gl;
}

function drawScene() {
    scene.draw(canvas, gl);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene();
}

function noLighting() {
}

function lambertLighting() {
}

function cookTorrance() {
}