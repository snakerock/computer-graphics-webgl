function Scene(canvas, gl) {

    this.lightPosition = Vector.create([0.0, 0.0, 600.0]);
    this.eyePosition = Vector.create([0.0, 0.0, 0.0]);
    this.objects = [];

    this.vMatrix = Matrix.I(4);
    this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);
    this.depthPMatrix = makePerspective(45, 1, 10, 1000);

    this.framebuffer = gl.createFramebuffer();
    this.depthTexture = gl.createTexture();
    this.colorTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Depth texture. Slower than a depth buffer, but you can sample it later in your shader
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, 1024, 1024, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);

    // Always check that our framebuffer is ok
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        alert("Framebuffer failed");
    }

    this.biasMatrix = Matrix.create([
        [0.5, 0.0, 0.0, 0.5],
        [0.0, 0.5, 0.0, 0.5],
        [0.0, 0.0, 0.5, 0.5],
        [0.0, 0.0, 0.0, 1.0]
    ]);

    this.angleX = 0;
    this.angleY = 0;
    this.oldZoom = 0;
    this.zoom = 0;

    this.vRotateXY = function(dx, dy) {
        this.angleY = dx;
        this.angleX = dy;
    };

    this.vTranslate = function(z) {
        this.oldZoom = this.zoom;
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

    this.generateDepthTexture = function(gl) {
        // The framebuffer, which regroups 0, 1, or more textures, and 0 or 1 depth buffer.
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.enable(gl.DEPTH_TEST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0,0,1024,1024);
        gl.colorMask(false, false, false, false);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var basicModelAttribs = { scene: this,
                                  vMatrix: Matrix.I(4),  // here is to point light
                                  pMatrix: this.depthPMatrix,
                                  lightPosition: this.lightPosition
                                };
        this.drawSortingShaders(gl, function(gl, scene, object, shader) {
                var modelAttribs = {
                                    lightPosition: scene.lightPosition
                                   };
                object.generateDepthTexture(gl, modelAttribs);
            },
            basicModelAttribs,
            [ DepthmapShader ]
        );
    };

    this.draw = function(canvas, gl) {
        if (this.objects.length == 0) return;

        this.vMatrix = Matrix.multiplyMatrices(Matrix.Translation($V([0, 0, this.zoom])).ensure4x4(),
                Matrix.RotationX(this.angleX).ensure4x4(),
                Matrix.RotationY(this.angleY).ensure4x4(),
                Matrix.Translation($V([0, 0, -this.oldZoom])),
                this.vMatrix
            );
        this.oldZoom = this.zoom;
        this.angleX = this.angleY = 0;
        this.generateDepthTexture(gl);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var depthBiasPMatrix = Matrix.multiplyMatrices(this.biasMatrix, this.depthPMatrix);
        var vLightPosition = Matrix.multiplyMatrices(this.lightPosition.ensure4());
        var vEyePosition = Matrix.multiplyMatrices(this.vMatrix, this.eyePosition.ensure4());
        var basicModelAttribs = { scene: this,
                                  vMatrix: this.vMatrix,
                                  pMatrix: this.pMatrix,
                                  lightPosition: vLightPosition,
                                  eyePosition: vEyePosition,
                                  depthTexture: this.depthTexture,
                                  depthBiasPMatrix: depthBiasPMatrix
                                };
        this.drawSortingShaders(gl, function(gl, scene, object, shader) {
                var modelAttribs = {
                                    depthBiasPMatrix: depthBiasPMatrix,
                                    lightPosition: vLightPosition
                                   };
                object.draw(gl, modelAttribs);
            },
            basicModelAttribs
        );
    };
}