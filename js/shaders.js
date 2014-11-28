function ShaderBase(gl, shaderProgram) {
    if (typeof(shaderProgram.vertexUrl) == 'string') {
        this.shaderProgram = shaderHandler.addShaderProg(gl, shaderProgram.vertexUrl, shaderProgram.fragmentUrl);
    } else {
        this.shaderProgram = shaderProgram;
    }

    this.setModelAttribs = function(gl, modelAttribs) {
        if (modelAttribs.scene !== undefined) {
            this.scene = modelAttribs.scene;
        }

        if (modelAttribs.mMatrix !== undefined) {
            if (modelAttribs.mMatrix.attrib === undefined) {
                this.mMatrix = modelAttribs.mMatrix.matrix;
            }
            if (modelAttribs.mMatrix.attrib === "scene") {
                this.mMatrix = modelAttribs.scene.mMatrix;
            }
            if (modelAttribs.mMatrix.attrib === "dup") {
                this.mMatrix = modelAttribs.mMatrix.matrix.dup();
            }
        }
        if (modelAttribs.vMatrix !== undefined) {
            if (modelAttribs.vMatrix.attrib === undefined) {
                this.vMatrix = modelAttribs.vMatrix.matrix;
            }
            if (modelAttribs.vMatrix.attrib === "scene") {
                this.vMatrix = modelAttribs.scene.vMatrix;

            }
            if (modelAttribs.vMatrix.attrib === "dup") {
                this.vMatrix = modelAttribs.vMatrix.matrix.dup();
            }
        }
        if (modelAttribs.pMatrix !== undefined) {
            if (modelAttribs.pMatrix.attrib === undefined) {
                this.pMatrix = modelAttribs.pMatrix.matrix;
            }
            if (modelAttribs.pMatrix.attrib === "scene") {
                this.pMatrix = modelAttribs.scene.pMatrix;
            }
            if (modelAttribs.pMatrix.attrib === "dup") {
                this.pMatrix = modelAttribs.pMatrix.matrix.dup();
            }
        }
    };

    this.switch = function(gl) {
        gl.useProgram(this.shaderProgram);

        this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(this.vertexPositionAttribute);

        this.mUniform = gl.getUniformLocation(this.shaderProgram, "uMMatrix");
        this.vUniform = gl.getUniformLocation(this.shaderProgram, "uVMatrix");
        this.pUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    };

    this.setUniforms = function(gl, modelAttribs) {
        this.setModelAttribs(gl, modelAttribs);

        if (modelAttribs.mMatrix !== undefined) {
            gl.uniformMatrix4fv(this.mUniform, false, new Float32Array(this.mMatrix.flatten()));
        }

        if (modelAttribs.vMatrix !== undefined) {
            gl.uniformMatrix4fv(this.vUniform, false, new Float32Array(this.vMatrix.flatten()));
        }

        if (modelAttribs.pMatrix !== undefined) {
            gl.uniformMatrix4fv(this.pUniform, false, new Float32Array(this.pMatrix.flatten()));
        }
    };

    this.setAttribs = function(gl, object) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.verticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    };

    this.drawElements = function(gl, object) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.facesBuffer);
        gl.drawElements(gl.TRIANGLES, object.model.faces.length, gl.UNSIGNED_SHORT, 0);
    };

    this.draw = function(gl, object, modelAttribs) {
        this.setUniforms(gl, modelAttribs);
        this.setAttribs(gl, object);
        this.drawElements(gl, object);
    }
}

function ColorShader(gl, shaderProgram) {

    var shader = new ShaderBase(gl, shaderProgram);

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.depthBiasMVP !== undefined) {
            if (modelAttribs.depthBiasMVP.attrib === undefined) {
                this.depthBiasMVP = modelAttribs.depthBiasMVP.matrix;
            }
            if (modelAttribs.depthBiasMVP.attrib === "scene") {
                this.depthBiasMVP = modelAttribs.scene.depthBiasMVP;
            }
            if (modelAttribs.depthBiasMVP.attrib === "dup") {
                this.depthBiasMVP = modelAttribs.depthBiasMVP.matrix.dup();
            }
        }

        if (modelAttribs.depthTexture !== undefined) {
            if (modelAttribs.depthTexture.attrib === undefined) {
                this.depthTexture = modelAttribs.depthTexture;
            }
            if (modelAttribs.depthTexture.attrib === "scene") {
                this.depthTexture = modelAttribs.scene.depthTexture;
            }
        }
    };

    var baseSwitch = shader.switch;
    shader.switch = function(gl) {
        baseSwitch.call(this, gl);

        this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(this.vertexColorAttribute);

        this.depthBiasMVPUniform = gl.getUniformLocation(this.shaderProgram, "uDepthBiasMVP");
        this.shadowMapUniform = gl.getUniformLocation(this.shaderProgram, "uShadowMap");
    };

    var baseSetAttribs = shader.setAttribs;
    shader.setAttribs = function(gl, object) {
        baseSetAttribs.call(this, gl, object);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.colorsBuffer);
        gl.vertexAttribPointer(this.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    };

    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, modelAttribs) {
        baseSetUniforms.call(this, gl, modelAttribs);

        if (modelAttribs.depthBiasMVP !== undefined) {
            gl.uniformMatrix4fv(this.depthBiasMVPUniform, false, new Float32Array(this.depthBiasMVP.flatten()));
        }


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.uniform1i(this.shadowMapUniform, 0);
    };

    shader.constructor = ColorShader;
    return shader;
}

function DepthmapShader(gl, shaderProgram) {
    var shader = new ShaderBase(gl, shaderProgram || { vertexUrl: 'vs-depthmap.glsl', fragmentUrl: 'fs-depthmap.glsl' });

    shader.constructor = DepthmapShader;
    return shader;
}

function NoLightShader(gl, shaderProgram) {
    var shader = new ColorShader(gl, shaderProgram || { vertexUrl: 'vs-main.glsl', fragmentUrl: 'fs-main.glsl' });

    shader.constructor = NoLightShader;
    return shader;
}

function LambertShader(gl, shaderProgram) {
    var shader = new ColorShader(gl, shaderProgram || { vertexUrl: 'vs-lambert.glsl', fragmentUrl: 'fs-lambert.glsl' });

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.depthBiasMVP !== undefined) {
            if (modelAttribs.depthBiasMVP.attrib === undefined) {
                this.depthBiasMVP = modelAttribs.depthBiasMVP.matrix;
            }
            if (modelAttribs.depthBiasMVP.attrib === "scene") {
                this.depthBiasMVP = modelAttribs.scene.depthBiasMVP;
            }
            if (modelAttribs.depthBiasMVP.attrib === "dup") {
                this.depthBiasMVP = modelAttribs.depthBiasMVP.matrix.dup();
            }
        }

        if (modelAttribs.normalMatrix !== undefined ||
            (modelAttribs.mMatrix !== undefined &&
             modelAttribs.vMatrix !== undefined)
           ) {
            this.normalMatrix = (this.vMatrix.x(this.mMatrix)).inverse().transpose();
            modelAttribs.normalMatrix = this.normalMatrix;
        }

        if (modelAttribs.lightPosition !== undefined) {
            if (modelAttribs.lightPosition.attrib === undefined) {
                this.lightPosition = modelAttribs.lightPosition;
            }
            if (modelAttribs.lightPosition.attrib === "scene") {
                this.lightPosition = modelAttribs.scene.lightPosition;
            }
            if (modelAttribs.lightPosition.attrib === "dup") {
                this.lightPosition = modelAttribs.lightPosition.matrix.dup();
            }
        }
    };

    var baseSwitch = shader.switch;
    shader.switch = function(gl, scene) {
        baseSwitch.call(this, gl, scene);

        this.vertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(this.vertexNormalAttribute);

        this.nUniform = gl.getUniformLocation(this.shaderProgram, "uNormalMatrix");
        this.lightUniform = gl.getUniformLocation(this.shaderProgram, "uLightPosition");
    };

    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, modelAttribs) {
        baseSetUniforms.call(this, gl, modelAttribs);

        if (modelAttribs.normalMatrix !== undefined) {
            gl.uniformMatrix4fv(this.nUniform, false, new Float32Array(this.normalMatrix.flatten()));
        }

        if (modelAttribs.lightPosition !== undefined) {
            gl.uniform4fv(this.lightUniform, new Float32Array(this.lightPosition.flatten()));
        }
    };

    var baseSetAttribs = shader.setAttribs;
    shader.setAttribs = function(gl, object) {
        baseSetAttribs.call(this, gl, object);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.normalsBuffer);
        gl.vertexAttribPointer(this.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    };

    shader.constructor = LambertShader;
    return shader;
}

function CookTorranceShader(gl, shaderProgram) {
    var shader = new LambertShader(gl, shaderProgram || { vertexUrl: 'vs-cook-torrance.glsl', fragmentUrl: 'fs-cook-torrance.glsl' });

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.eyePosition !== undefined) {
            if (modelAttribs.eyePosition.attrib === undefined) {
                this.eyePosition = modelAttribs.eyePosition;
            }
            if (modelAttribs.eyePosition.attrib === "scene") {
                this.eyePosition = modelAttribs.scene.eyePosition;
            }
            if (modelAttribs.eyePosition.attrib === "dup") {
                this.eyePosition = modelAttribs.eyePosition.matrix.dup();
            }
        }
    };

    var baseSwitch = shader.switch;
    shader.switch = function(gl, scene) {
        baseSwitch.call(this, gl, scene);
        this.eyeUniform = gl.getUniformLocation(this.shaderProgram, "uEyePosition");
    };

    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, modelAttribs) {
        baseSetUniforms.call(this, gl, modelAttribs);

        if (modelAttribs.eyePosition !== undefined) {
            gl.uniform4fv(this.eyeUniform, new Float32Array(scene.eyePosition.flatten()));
        }
    };

    shader.constructor = CookTorranceShader;
    return shader;
}