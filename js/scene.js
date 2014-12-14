function Light(position, color, specColor, ambientColor) {
    this.position = $V(position);
    this.color = $V(color);
    this.specColor = $V(specColor);
    this.ambientColor = $V(ambientColor)
};

function Scene(canvas, gl) {

    this.light = new Light([-10.0, 20.0, 15.0], [1.0, 1.0, 1.0], [1.0, 1.0, 0.7], [0.01, 0.07, 0.01]);
    this.eyePosition = Vector.create([0.0, 0.0, 0.0]);
    this.objects = [];

    this.vMatrix = Matrix.I(4);
    this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);
    this.depthPMatrix = makePerspective(45, 1, 10, 1000);

    this.depthFramebuffer = gl.createFramebuffer();
    this.depthRenderBuffer = gl.createRenderbuffer();
    this.depthColorTexture = gl.createTexture();
    this.currentDepthTexture = this.depthColorTexture;
    this.depthTextureSize = 512;

    this.depthBlurFramebuffer = gl.createFramebuffer();
    this.depthBlurTexture = gl.createTexture();

    this.blurShader = new GaussBlurShader(gl);

    this.fogDepth = 1.5;
    this.renderFog = true;

    this.enableFog = function() {
        this.renderFog = true;
    };

    this.disableFog = function() {
        this.renderFog = false;
    };

    this.setupScreen = function() {
        this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);
    };

    gl.bindTexture(gl.TEXTURE_2D, this.depthColorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.depthTextureSize, this.depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.depthTextureSize, this.depthTextureSize);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthRenderBuffer);
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

    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert("Depth blur framebuffer failed");
    }

    this.renderFramebuffer = gl.createFramebuffer();
    this.postProccessFramebuffer = gl.createFramebuffer();

    this.createRenderPPTextures = function(gl) {
        gl.deleteTexture(this.renderTexture);
        gl.deleteRenderbuffer(this.renderDepthRenderBuffer);
        gl.deleteTexture(this.postProccessTexture);
        gl.deleteRenderbuffer(this.postProccessDepthRenderBuffer);

        this.renderTexture = gl.createTexture();
        this.renderDepthRenderBuffer = gl.createRenderbuffer();
        this.postProccessTexture = gl.createTexture();
        this.postProccessDepthRenderBuffer = gl.createRenderbuffer();

        gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderDepthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.renderTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderDepthRenderBuffer);

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

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.postProccessDepthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postProccessFramebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.postProccessTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.postProccessDepthRenderBuffer);

        // Always check that our framebuffer is ok
        if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
            alert("Post-process framebuffer failed");
        }
    };

    this.createRenderPPTextures(gl);

    this.noProcessing = function() {
    };

    this.gaussBlur = function() {
        var radius = Math.min(Math.max((this.fogDepth - this.eyeDepth + 0.3) / this.fogDepth * 2, 0.0), 4.0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.postProccessFramebuffer);
        gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var blurAttribs = {
            texture: this.renderTexture,
            resolutionX: canvas.width,
            resolutionY: canvas.height,
            radius: radius,
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
            radius: radius,
            direction: 'y'
        };
        this.blurShader.switch(gl);
        this.blurShader.draw(gl, blurAttribs);
        this.currentDepthTexture = this.depthColorTexture;
    };

    this.processingFrameBuffer = this.renderFramebuffer;
    this.processing = this.gaussBlur;

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
    this.zoom = -10;

    this.rotateXY = function(dx, dy) {
        this.angleY += dx;

        if (this.angleX + dy >= 0.0 && this.angleX + dy < Math.PI) {
            this.angleX += dy;
        }
    };

    this.zoomScene = function(z) {
        if (this.zoom + z / 10 < -5.0 && this.zoom + z / 10 > -1000) {
            this.zoom += z / 10;
        }
    };

    this.setShaderModelAttribs = function(gl, shader, basicModelAttribs) {
        shader.switch(gl);
        shader.setUniforms(gl, basicModelAttribs);
    };

    this.drawSortingShaders = function(gl, drawFunction, basicModelAttribs, shaderCollection) {
        if (shaderCollection === undefined) {
            shaderCollection = [ ShaderBase, LightShader, NoLightShader, LambertShader, CookTorranceShader ];
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
        return this.lookAt(this.light.position.elements, [0, 0, 0]);
    };

    this.generateDepthTexture = function(gl) {
        this.currentDepthTexture = this.depthColorTexture;
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.enable(gl.DEPTH_TEST);
        gl.cullFace(gl.FRONT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFramebuffer);
        gl.viewport(0, 0, this.depthTextureSize, this.depthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var vMatrix = this.lookFromLightToCenter();
        var basicModelAttribs = { scene: this,
                                  vMatrix: vMatrix,
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

        gl.cullFace(gl.BACK);

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

        this.vMatrix = Matrix.multiplyMatrices(
            Matrix.Translation($V([0, -0.5, 0])).ensure4x4(),
            Matrix.Translation($V([0, 0, this.zoom])).ensure4x4(),
            Matrix.RotationX(this.angleX).ensure4x4(),
            Matrix.RotationY(this.angleY).ensure4x4()
        );

        var depthBiasPMatrix = Matrix.multiplyMatrices(this.biasMatrix, this.depthPMatrix);
        var vEyePosition = Matrix.multiplyMatrices(this.vMatrix.inverse(), this.eyePosition.ensure4());
        this.eyeDepth = vEyePosition.elements[1];
        var vLightPosition = this.lookFromLightToCenter();

        this.generateDepthTexture(gl);

        var fb = this.processingFrameBuffer;
        if (this.processing === this.gaussBlur && (this.eyeDepth > this.fogDepth || this.renderFog == false)) {
            fb = null;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindTexture(gl.TEXTURE_2D, this.currentDepthTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var basicModelAttribs = { scene: this,
                                  vMatrix: this.vMatrix,
                                  pMatrix: this.pMatrix,
                                  lightPosition: this.light.position.ensure4(),
                                  vLight: vLightPosition,
                                  lightAmbientColor: this.light.ambientColor,
                                  lightColor: this.light.color,
                                  lightSpecColor: this.light.specColor,
                                  eyePosition: vEyePosition,
                                  depthTexture: this.currentDepthTexture,
                                  depthBiasPMatrix: depthBiasPMatrix,
                                  fogDepth: this.fogDepth,
                                  renderFog: this.renderFog
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

        if (fb != null) {
            this.processing();
        }
    };

    this.startLightAnimation = function(canvas, gl) {
        var scene = this;
        var k = 0.1;
        this.lightAnimationInc = this.lightAnimationInc || -1;

        this.lightAnimation = setInterval(function() {
            if (Math.abs(scene.light.position.elements[2]) > 40.0) {
                scene.lightAnimationInc *= -1;
            }
            scene.light.position.elements[2] += scene.lightAnimationInc * k;
            scene.draw(canvas, gl);
        }, 100);

        this.stopLightAnimation = function() {
            if (this.lightAnimation !== undefined) {
                clearInterval(this.lightAnimation);
            }
        };
    }
}