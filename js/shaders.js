function Shader(gl, shaderProgram) {
    if (typeof(shaderProgram.vertexUrl) == 'string') {
        this.shaderProgram = shaderHandler.addShaderProg(gl, shaderProgram.vertexUrl, shaderProgram.fragmentUrl);
    } else {
        this.shaderProgram = shaderProgram;
    }

    this.switch = function(gl) {
        gl.useProgram(this.shaderProgram);

        this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(this.vertexPositionAttribute);
        this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(this.vertexColorAttribute);
    };

    this.setUniforms = function(gl, scene) {
        var pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(scene.pMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(scene.mvMatrix.flatten()));
    };

    this.setAttribs = function(gl, object) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.verticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.colorsBuffer);
        gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    }

    this.drawElements = function(gl, object) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.facesBuffer);
        gl.drawElements(gl.TRIANGLES, object.model.faces.length, gl.UNSIGNED_SHORT, 0);
    }

    this.draw = function(gl, scene, object) {
        this.setUniforms(gl, scene);
        this.setAttribs(gl, object);
        this.drawElements(gl, object);
    }
}

function NoLightShader(gl, shaderProgram) {
    var shader = new Shader(gl, shaderProgram || { vertexUrl: 'vs-main.glsl', fragmentUrl: 'fs-main.glsl' });
    return shader;
}

function LambertShader(gl, shaderProgram) {
    var shader = new Shader(gl, shaderProgram || { vertexUrl: 'vs-lambert.glsl', fragmentUrl: 'fs-lambert.glsl' });

    var baseSwitch = shader.switch;
    shader.switch = function(gl, scene) {
        baseSwitch.call(this, gl, scene);

        this.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(this.vertexNormalAttribute);
    };

    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, scene) {
        baseSetUniforms.call(this, gl, scene);

        var normalMatrix = scene.mvMatrix.inverse().transpose();
        var nUniform = gl.getUniformLocation(this.shaderProgram, "uNormalMatrix");
        gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));

        var lightUniform = gl.getUniformLocation(this.shaderProgram, "uLightPosition");
        gl.uniform4fv(lightUniform, new Float32Array(scene.lightPosition.flatten()));
    };

    var baseSetAttribs = shader.setAttribs;
    shader.setAttribs = function(gl, object) {
        baseSetAttribs.call(this, gl, object);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.normalsBuffer);
        gl.vertexAttribPointer(this.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    };

    return shader;
}

function CookTorranceShader(gl, shaderProgram) {
    var shader = new LambertShader(gl, shaderProgram || { vertexUrl: 'vs-cook-torrance.glsl', fragmentUrl: 'fs-cook-torrance.glsl' });

    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, scene) {
        baseSetUniforms.call(this, gl, scene);

        var eyeUniform = gl.getUniformLocation(this.shaderProgram, "uEyePosition");
        gl.uniform4fv(eyeUniform, new Float32Array(scene.eyePosition.flatten()));
    };

    return shader;
}