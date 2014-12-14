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
        url: "glssl/" + file + ".glsl",
        dataType: "text",
        success: function(result) {
            shaderSource = { script: result, type: type, file: file };
        },
        error: function() {
            var source = $('#' + file).html();
            if (source !== undefined) {
                shaderSource = { script: source, type: type, file: file };
            } else {
                alert("Shaders not found anywhere.");
            }
        }
    });

    shaderHandler.allShaders[file] = shaderSource;
};

shaderHandler.getShader = function (gl, id) {

    var shaderSource = shaderHandler.allShaders[id];
    var shader = gl.createShader(shaderSource.type);
    gl.shaderSource(shader, shaderSource.script);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("Error in " + shaderSource.file + ":\n" + gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;

};