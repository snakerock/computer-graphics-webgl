function Object3D(gl, model, shader, position) {
    if (typeof(model) == 'string') {
        this.model = Loader.load(gl, model);
    } else {
        this.model = model;
    }

    this.shader = shader;
    this.position = position || [0.0, 0.0, 0.0];
    this.randColors = false;

    this.setColor = function(color) {
        this.model.colors = [];

        var object = this;
        this.model.vertices.forEach(function () {
            if (object.randColors) {
                for (var j = 0; j < 3; ++j) {
                    object.model.colors.push(Math.random());
                }
                object.model.colors.push(1.0);
            } else {
                for (var j = 0; j < 4; ++j) {
                    object.model.colors.push(color[j]);
                }
            }
        });

        this.model.metadata.colors = this.model.metadata.vertices;
    };
    this.setColor([1.0, 1.0, 1.0, 1.0]);

    this.verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);

    this.normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertexNormals), gl.STATIC_DRAW);

    this.colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.colors), gl.STATIC_DRAW);

    this.facesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model.faces), gl.STATIC_DRAW);

    this.draw = function(gl, scene) {
        var baseMV = scene.mvMatrix;
        scene.mvTranslate(this.position);
        scene.transform();

        this.shader.switch(gl);
        this.shader.draw(gl, scene, this);

        scene.mvMatrix = baseMV;
    }
}