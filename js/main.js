var canvas;
var gl;
var scene;
var isMouseDown = false;
var mousePos = [0, 0];

function start() {
    canvas = $("#glcanvas")[0];
    gl = initWebGL(canvas);

    if (gl) {
        gl.clearColor(0.5, 0.5, 0.5, 1.0);                      // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear the color as well as the depth buffer.
        //depthTextureExt = gl.getExtension("WEBGL_depth_texture");
        //console.log(depthTextureExt);
        //gl.getExtension('OES_texture_float');
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
    var noLightShader = new NoLightShader(gl);
    var lambertShader = new LambertShader(gl);
    var cookTorranceShader = new CookTorranceShader(gl);
    var depthMapshader = new DepthmapShader(gl);
    scene.objects.push(new Object3D(gl, "terrain.json", lambertShader, depthMapshader, [0.0, -0.35, 0.0], 0.5));
    scene.objects.push(new Object3D(gl, "ozzy.json", lambertShader, depthMapshader, [0.0, 0.0, 50.0], 0.01));
    //scene.objects.push(new Object3D(gl, "ozzy.json", lambertShader, depthMapshader, [0.0, -200, 50.0]));
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
    scene.createRenderPPTextures(gl);
    drawScene();
}

function noLighting() {
}

function lambertLighting() {
}

function cookTorrance() {
}

function noProcessing() {
    scene.setPostProcessing("NoProcessing");
}

function gaussBlur() {
    scene.setPostProcessing("GaussBlur");
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};