shaderHandler = {};
shaderHandler.allShaders = {};

shaderHandler.addShaderProg = function (gl, vertex, fragment) {

    shaderHandler.loadShader(vertex, gl.VERTEX_SHADER);
    shaderHandler.loadShader(fragment, gl.FRAGMENT_SHADER);

    var vertexShader = shaderHandler.getShader(gl, vertex);
    var fragmentShader = shaderHandler.getShader(gl, fragment);

    var prog = gl.createProgram();
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(prog));
    }

    return prog;
};

shaderHandler.loadShader = function(file, type) {
    var shaderSource;

    $.ajax({
        async: false,
        url: "glsl/" + file,
        dataType: "text",
        success: function(result) {
            shaderSource = {script: result, type: type};
        }
    });

    shaderHandler.allShaders[file] = shaderSource;
};

shaderHandler.getShader = function (gl, id) {

    //get the shader object from our main.shaders repository
    var shaderSource = shaderHandler.allShaders[id];

    //create the right shader
    var shader = gl.createShader(shaderSource.type);

    //wire up the shader and compile
    gl.shaderSource(shader, shaderSource.script);
    gl.compileShader(shader);

    //if things didn't go so well alert
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    //return the shader reference
    return shader;

};