var canvas;
var gl;
var scene;
var isMouseDown = false;
var mousePos = [0, 0];

function start() {

    canvas = document.getElementById("glcanvas");
    gl = initWebGL(canvas);

    if (gl) {
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    } else {
        alert("Could not initialize WebGL. Update your browser or check settings.");
        return;
    }

    scene = new Scene(canvas, gl);
    var noLightShader = new NoLightShader(gl);
    var lambertShader = new LambertShader(gl);
    var cookTorranceShader = new CookTorranceShader(gl);
    var depthMapshader = new DepthmapShader(gl);
    scene.objects.push(new Object3D(gl, "terrain.json", lambertShader, depthMapshader, [2.7, -0.15, 0.0], 10, [0.4, 0.7, 0.4, 1.0]));
    scene.objects.push(new Object3D(gl, "ozzy.json", lambertShader, depthMapshader, [-190.0, 13.0, 0.0], 0.01, [0.8, 0.8, 0.8, 1.0]));
    scene.objects.push(new Object3D(gl, "chev.json", cookTorranceShader, depthMapshader, [0.0, 3.0, 0.0], 0.4, [0.8, 0.3, 0.3, 1.0]));
    scene.objects.push(new Object3D(gl, "stone1.json", lambertShader, depthMapshader, [8.0, 0.0, -10.0], 0.5, [0.4, 0.35, 0.33, 1.0]));
    scene.objects.push(new Object3D(gl, "stone3.json", lambertShader, depthMapshader, [1.0, 0.0, -11.0], 0.5, [0.4, 0.35, 0.33, 1.0]));
    scene.objects.push(new Object3D(gl, "stone4.json", lambertShader, depthMapshader, [13.0, 0.0, -8.0], 0.4, [0.4, 0.35, 0.33, 1.0]));
    scene.objects.push(new Object3D(gl, "stone2.json", lambertShader, depthMapshader, [8.0, 0.0, -5.0], 0.4, [0.4, 0.35, 0.33, 1.0]));
    scene.objects.push(new Object3D(gl, "stone5.json", lambertShader, depthMapshader, [-5.0, 0.0, -4.0], 0.7, [0.4, 0.35, 0.33, 1.0]));

    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();

    var mousedown = function (event) {
        isMouseDown = true;
        if (event.changedTouches !== undefined) {
            event = event.changedTouches[0];
        }
        mousePos = [event.pageX, event.pageY];
    };

    var mousemove = function (event) {
        if (isMouseDown) {
            var zooming = false;

            if (event.changedTouches !== undefined) {
                event = event.changedTouches[0];

                if (event.pageX > canvas.width * 4 / 5) {
                    zooming = true;
                }
            }

            if (zooming) {
                scene.zoomScene(event.pageY - mousePos[1]);
                drawScene();
            } else {
                scene.rotateXY((event.pageX - mousePos[0]) / 100, (event.pageY - mousePos[1]) / 100);
                drawScene();
            }
            mousePos = [event.pageX, event.pageY];
        }
    };
    var mouseup = function (event) {
        isMouseDown = false;
    };

    canvas.addEventListener("touchstart", mousedown, false);
    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("touchend", mouseup, false);
    canvas.addEventListener("mouseup", mouseup, false);
    canvas.addEventListener("touchmove", mousemove, false);
    canvas.addEventListener("mousemove", mousemove, false);

    canvas.addEventListener("mousewheel", function(event) {
        var z = event.wheelDelta > 0 ? 10 : -10;
        scene.zoomScene(z);
        drawScene();
    }, false);

    setTimeout(function() {
        document.getElementById("info").style.display = "none";
    }, 8000);
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
    scene.setupScreen();
    scene.createRenderPPTextures(gl);
    drawScene();
}

function noProcessing() {
    scene.setPostProcessing("NoProcessing");
}

function gaussBlur() {
    scene.setPostProcessing("GaussBlur");
}

function stopLightAnimation() {
    scene.stopLightAnimation();
}

function startLightAnimation() {
    scene.startLightAnimation(canvas, gl);
}

function enableFog() {
    scene.enableFog();
    drawScene();
}

function disableFog() {
    scene.disableFog();
    drawScene();
}

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
};