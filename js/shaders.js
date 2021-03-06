function ShaderBase(gl, shaderProgram) {
    if (typeof(shaderProgram.vertexUrl) == 'string') {
        this.shaderProgram = shaderHandler.addShaderProg(gl, shaderProgram.vertexUrl, shaderProgram.fragmentUrl);
    } else {
        this.shaderProgram = shaderProgram;
    }

    this.mMatrix = Matrix.I(4);
    this.vMatrix = Matrix.I(4);

    this.setModelAttribs = function(gl, modelAttribs) {
        if (modelAttribs.scene !== undefined) {
            this.scene = modelAttribs.scene;
        }

        if (modelAttribs.mMatrix !== undefined) {
            this.mMatrix = modelAttribs.mMatrix;
        }
        if (modelAttribs.vMatrix !== undefined) {
            this.vMatrix = modelAttribs.vMatrix;
        }
        if (modelAttribs.pMatrix !== undefined) {
            this.pMatrix = modelAttribs.pMatrix;
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

function LightShader(gl, shaderProgram) {

    var shader = new ShaderBase(gl, shaderProgram);

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.depthBiasMVP !== undefined) {
            this.depthBiasMVP = modelAttribs.depthBiasMVP;
        }

        if (modelAttribs.depthTexture !== undefined) {
            this.depthTexture = modelAttribs.depthTexture;
        }

        if (modelAttribs.eyePosition !== undefined) {
            this.eyePosition = modelAttribs.eyePosition.ensure4();
        }

        if (modelAttribs.lightAmbientColor !== undefined) {
            this.lightAmbientColor = modelAttribs.lightAmbientColor;
        }

        if (modelAttribs.lightColor !== undefined) {
            this.lightColor = modelAttribs.lightColor;
        }

        if (modelAttribs.renderFog === false) {
            modelAttribs.fogDepth = undefined;
            this.fogDepth = undefined;
        }

        if (modelAttribs.fogDepth !== undefined) {
            this.fogDepth = modelAttribs.fogDepth;
        } else if (this.fogDepth === undefined) {
            modelAttribs.fogDepth = -1.0;
            this.fogDepth = modelAttribs.fogDepth;
        }
    };

    var baseSwitch = shader.switch;
    shader.switch = function(gl) {
        baseSwitch.call(this, gl);

        this.vertexColorAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(this.vertexColorAttribute);

        this.depthBiasMVPUniform = gl.getUniformLocation(this.shaderProgram, "uDepthBiasMVP");
        this.shadowMapUniform = gl.getUniformLocation(this.shaderProgram, "uShadowMap");
        this.eyeUniform = gl.getUniformLocation(this.shaderProgram, "uEyePosition");
        this.lightAmbientColorUniform = gl.getUniformLocation(this.shaderProgram, "uLightAmbientColor");
        this.lightColorUniform = gl.getUniformLocation(this.shaderProgram, "uLightColor");
        this.fogDepthUniform = gl.getUniformLocation(this.shaderProgram, "uFogDepth");
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

        if (modelAttribs.depthTexture !== undefined) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
            gl.uniform1i(this.shadowMapUniform, 0);
        }

        if (modelAttribs.eyePosition !== undefined) {
            gl.uniform4fv(this.eyeUniform, new Float32Array(this.eyePosition.flatten()));
        }

        if (modelAttribs.lightAmbientColor !== undefined) {
            gl.uniform3fv(this.lightAmbientColorUniform, new Float32Array(this.lightAmbientColor.flatten()));
        }

        if (modelAttribs.lightColor !== undefined) {
            gl.uniform3fv(this.lightColorUniform, new Float32Array(this.lightColor.flatten()));
        }

        if (modelAttribs.fogDepth !== undefined) {
            gl.uniform1f(this.fogDepthUniform, this.fogDepth);
        }
    };

    shader.constructor = LightShader;
    return shader;
}

function DepthmapShader(gl, shaderProgram) {
    var shader = new ShaderBase(gl, shaderProgram || { vertexUrl: 'vs-depthmap', fragmentUrl: 'fs-depthmap' });

    shader.constructor = DepthmapShader;
    return shader;
}

function NoLightShader(gl, shaderProgram) {
    var shader = new LightShader(gl, shaderProgram || { vertexUrl: 'vs-main', fragmentUrl: 'fs-main' });

    shader.constructor = NoLightShader;
    return shader;
}

function LambertShader(gl, shaderProgram) {
    var shader = new LightShader(gl, shaderProgram || { vertexUrl: 'vs-lambert', fragmentUrl: 'fs-lambert' });

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.mMatrix !== undefined || modelAttribs.vMatrix !== undefined) {
            this.normalMatrix = Matrix.multiplyMatrices(this.vMatrix, this.mMatrix).inverse().transpose();
            modelAttribs.normalMatrix = { matrix: this.normalMatrix };
        }

        if (modelAttribs.lightPosition !== undefined) {
            this.lightPosition = modelAttribs.lightPosition.ensure4();
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
    var shader = new LambertShader(gl, shaderProgram || { vertexUrl: 'vs-cook-torrance', fragmentUrl: 'fs-cook-torrance' });

    var baseSetModelAttribs = shader.setModelAttribs;
    shader.setModelAttribs = function(gl, modelAttribs) {
        baseSetModelAttribs.call(this, gl, modelAttribs);

        if (modelAttribs.lightSpecColor !== undefined) {
            this.lightSpecColor = modelAttribs.lightSpecColor;
        }
    };

    var baseSwitch = shader.switch;
    shader.switch = function(gl, scene) {
        baseSwitch.call(this, gl, scene);

        this.lightSpecColorUniform = gl.getUniformLocation(this.shaderProgram, "uLightSpecColor");
    };


    var baseSetUniforms = shader.setUniforms;
    shader.setUniforms = function(gl, modelAttribs) {
        baseSetUniforms.call(this, gl, modelAttribs);

        if (modelAttribs.lightSpecColor !== undefined) {
            gl.uniform3fv(this.lightSpecColorUniform, new Float32Array(this.lightSpecColor.flatten()));
        }
    };

    shader.constructor = CookTorranceShader;
    return shader;
}

function GaussBlurShader(gl, shaderProgram) {
    this.shaderProgram = shaderProgram || shaderHandler.addShaderProg(gl, "vs-gauss", "fs-gauss");

    this.setModelAttribs = function(gl, modelAttribs) {
        this.radius = 1;
        this.direction = 'x';

        if (modelAttribs.texture !== undefined) {
            this.texture = modelAttribs.texture;
        }
        if (modelAttribs.resolution !== undefined) {
            this.resolutionX = this.resolutionY = modelAttribs.resolution;
        }
        if (modelAttribs.resolutionX !== undefined && modelAttribs.resolutionY !== undefined) {
            this.resolutionX = modelAttribs.resolutionX;
            this.resolutionY = modelAttribs.resolutionY;
        }
        if (modelAttribs.radius !== undefined) {
            this.radius = modelAttribs.radius;
        }
        if (modelAttribs.direction !== undefined) {
            this.direction = modelAttribs.direction;
        }
    };

    this.switch = function(gl) {
        gl.useProgram(this.shaderProgram);

        this.vertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(this.vertexPositionAttribute);

        this.textureUniform = gl.getUniformLocation(this.shaderProgram, "uTexture");
        this.resolutionXUniform = gl.getUniformLocation(this.shaderProgram, "uResolutionX");
        this.resolutionYUniform = gl.getUniformLocation(this.shaderProgram, "uResolutionY");
        this.radiusUnifrom = gl.getUniformLocation(this.shaderProgram, "uRadius");
        this.directionUniform = gl.getUniformLocation(this.shaderProgram, "uDirection");
    };

    this.setUniforms = function(gl, modelAttribs) {
        this.setModelAttribs(gl, modelAttribs);

        if (modelAttribs.texture !== undefined) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(this.textureUniform, 0);
        }

        if (modelAttribs.resolution !== undefined ||
            (modelAttribs.resolutionX !== undefined && modelAttribs.resolutionY !== undefined)) {
            gl.uniform1f(this.resolutionXUniform, this.resolutionX);
            gl.uniform1f(this.resolutionYUniform, this.resolutionY);
        }
        if (modelAttribs.radius !== undefined) {
            gl.uniform1f(this.radiusUnifrom, this.radius);
        }
        if (modelAttribs.direction !== undefined) {
            gl.uniform2fv(this.directionUniform, new Float32Array(this.direction == 'x' ? [1, 0] : [0, 1]));
        }
    };

    this.setAttribs = function(gl) {
        if (this.verticesBuffer === undefined) {
            this.verticesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(this.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);
    };

    this.drawElements = function(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    this.draw = function(gl, modelAttribs) {
        this.setUniforms(gl, modelAttribs);
        this.setAttribs(gl);
        this.drawElements(gl);
    };
}