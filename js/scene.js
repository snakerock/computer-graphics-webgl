function Scene(canvas, gl) {

    this.lightPosition = Vector.create([0.0, 60.0, 50.0]);
    this.eyePosition = Vector.create([0.0, 0.0, 0.0]);
    this.objects = [];

    this.vMatrix = Matrix.I(4);
    this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);
    this.depthPMatrix = makePerspective(45, 1, 10, 1000);

    this.depthFramebuffer = gl.createFramebuffer();
    this.depthTexture = gl.createTexture();
    this.depthColorTexture = gl.createTexture();
    this.currentDepthTexture = this.depthColorTexture;
    this.depthTextureSize = 512;

    this.depthBlurFramebuffer = gl.createFramebuffer();
    this.depthBlurTexture = gl.createTexture();

    this.blurShader = new GaussBlurShader(gl);

    gl.bindTexture(gl.TEXTURE_2D, this.depthColorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.depthTextureSize, this.depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Depth texture. Slower than a depth buffer, but you can sample it later in your shader
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.depthTextureSize, this.depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LNEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.depthColorTexture, 0);

    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert("Depth framebuffer failed");
    }

    gl.bindTexture(gl.TEXTURE_2D, this.depthBlurTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.depthTextureSize, this.depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthBlurFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.depthBlurTexture, 0);

    // Always check that our framebuffer is ok
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert("Depth blur framebuffer failed");
    }

    this.renderFramebuffer = gl.createFramebuffer();
    this.postProccessFramebuffer = gl.createFramebuffer();

    this.createRenderPPTextures = function(gl) {
        gl.deleteTexture(this.renderTexture);
        gl.deleteTexture(this.renderDepthTexture);
        gl.deleteTexture(this.postProccessTexture);
        gl.deleteTexture(this.postProccessDepthTexture);

        this.renderTexture = gl.createTexture();
        this.renderDepthTexture = gl.createTexture();
        this.postProccessTexture = gl.createTexture();
        this.postProccessDepthTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, this.renderDepthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, canvas.width, canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LNEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.renderDepthTexture, 0);

        // Always check that our framebuffer is ok
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            alert("Render framebuffer failed");
        }

        gl.bindTexture(gl.TEXTURE_2D, this.postProccessTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, this.postProccessDepthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, canvas.width, canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LNEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postProccessFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.postProccessTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.postProccessDepthTexture, 0);

        // Always check that our framebuffer is ok
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            alert("Post-process framebuffer failed");
        }
    };

    this.createRenderPPTextures(gl);

    this.noProcessing = function() {
        return;
    };

    this.gaussBlur = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postProccessFramebuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var blurAttribs = {
            texture: this.renderTexture,
            resolutionX: canvas.width,
            resolutionY: canvas.height,
            radius: 2,
            direction: 'x'
        };
        this.blurShader.switch(gl);
        this.blurShader.draw(gl, blurAttribs);
        this.currentDepthTexture = this.depthColorTexture;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.postProccessTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var blurAttribs = {
            texture: this.postProccessTexture,
            resolutionX: canvas.width,
            resolutionY: canvas.height,
            radius: 2,
            direction: 'y'
        };
        this.blurShader.switch(gl);
        this.blurShader.draw(gl, blurAttribs);
        this.currentDepthTexture = this.depthColorTexture;
    };

    this.processingFrameBuffer = null;
    this.processing = this.noProcessing;

    this.setPostProcessing = function(processingType) {
        switch(processingType) {
            case "NoProcessing":
                this.processingFrameBuffer = null;
                this.processing = this.noProcessing;
                break;

            case "GaussBlur":
                this.processingFrameBuffer = this.renderFramebuffer;
                this.processing = this.gaussBlur;
                break;
        }

        this.draw(canvas, gl);
    };

    this.biasMatrix = Matrix.create([
        [0.5, 0.0, 0.0, 0.5],
        [0.0, 0.5, 0.0, 0.5],
        [0.0, 0.0, 0.5, 0.5],
        [0.0, 0.0, 0.0, 1.0]
    ]);

    this.angleX = 0;
    this.angleY = 0;
    this.zoom = 0;

    this.vRotateXY = function(dx, dy) {
        this.angleY += dx;
        this.angleX += dy;
    };

    this.vTranslate = function(z) {
        this.zoom += z;
    };

    this.setShaderModelAttribs = function(gl, shader, basicModelAttribs) {
        shader.switch(gl);
        shader.setUniforms(gl, basicModelAttribs);
    };

    this.drawSortingShaders = function(gl, drawFunction, basicModelAttribs, shaderCollection) {
        if (shaderCollection === undefined) {
            shaderCollection = [ ShaderBase, ColorShader, NoLightShader, LambertShader, CookTorranceShader ];
        }

        var scene = this;
        shaderCollection.forEach(function(shaderType) {
            var initialized = false;

            scene.objects.forEach(function(object) {
                if (object.shader.constructor === shaderType) {
                    var shader = object.shader;
                }
                if (object.depthmapShader.constructor === shaderType) {
                    var shader = object.depthmapShader;
                }

                if (shader !== undefined) {
                    if (!initialized) {
                        scene.setShaderModelAttribs(gl, shader, basicModelAttribs);
                        initialized = true;
                    }

                    drawFunction(gl, scene, object, shader);
                }
            });
        });
    };

    this.lookAt = function(from, to) {
        return makeLookAt(from[0], from[1], from[2], to[0], to[1], to[2], 0, 1, 0);
    };

    this.lookFromLightToCenter = function() {
        return this.lookAt(this.lightPosition.elements, [0, 0, 0]);
    };

    this.generateDepthTexture = function(gl) {
        // The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
        this.currentDepthTexture = this.depthColorTexture;
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.POLYGON_OFFSET_FILL);
        //gl.polygonOffset(4, 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
        //gl.colorMask(false, false, false, false);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var vMatrix = this.lookFromLightToCenter();
        var basicModelAttribs = { scene: this,
                                  vMatrix: vMatrix,//Matrix.RotationX(Math.PI / 2),  // here is to point light
                                  pMatrix: this.depthPMatrix
                                };
        this.drawSortingShaders(gl, function(gl, scene, object, shader) {
                var modelAttribs = {
                                   };
                object.generateDepthTexture(gl, modelAttribs);
            },
            basicModelAttribs,
            [ DepthmapShader ]
        );
        //gl.disable(gl.POLYGON_OFFSET_FILL);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthBlurFramebuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.currentDepthTexture);
        gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var blurAttribs = {
            texture: this.currentDepthTexture,
            resolution: this.depthTextureSize,
            radius: this.depthTextureSize / 500,
            direction: 'x'
        };
        this.blurShader.switch(gl);
        this.blurShader.draw(gl, blurAttribs);
        this.currentDepthTexture = this.depthBlurTexture;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.currentDepthTexture);
        gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var blurAttribs = {
            texture: this.currentDepthTexture,
            resolution: this.depthTextureSize,
            radius: this.depthTextureSize / 500,
            direction: 'y'
        };
        this.blurShader.switch(gl);
        this.blurShader.draw(gl, blurAttribs);
        this.currentDepthTexture = this.depthColorTexture;
    };

    this.draw = function(canvas, gl) {
        if (this.objects.length == 0) return;

        this.vMatrix = Matrix.multiplyMatrices(Matrix.Translation($V([0, 0, this.zoom])).ensure4x4(),
            Matrix.RotationX(this.angleX).ensure4x4(),
            Matrix.RotationY(this.angleY).ensure4x4()
        );

        this.generateDepthTexture(gl);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.processingFrameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.currentDepthTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        //gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var depthBiasPMatrix = Matrix.multiplyMatrices(this.biasMatrix, this.depthPMatrix);
        var vEyePosition = Matrix.multiplyMatrices(this.eyePosition.ensure4());
        var vLightPosition = this.lookFromLightToCenter();
        var basicModelAttribs = { scene: this,
                                  vMatrix: this.vMatrix,
                                  pMatrix: this.pMatrix,
                                  lightPosition: this.lightPosition.ensure4(),
                                  vLight: vLightPosition,
                                  eyePosition: vEyePosition,
                                  depthTexture: this.currentDepthTexture,
                                  depthBiasPMatrix: depthBiasPMatrix
                                };
        this.drawSortingShaders(gl, function(gl, scene, object, shader) {
                var modelAttribs = {
                                    depthBiasPMatrix: depthBiasPMatrix,
                                    vLight: vLightPosition
                                   };
                object.draw(gl, modelAttribs);
            },
            basicModelAttribs
        );

        this.processing();
    };
}