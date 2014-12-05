var Cube = {
    vertices: [
        // Front face
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ],
    colors: [
        [0.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ],
    generatedColors: [],
    cubeVertexIndices: [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ],

    initBuffers: function(gl) {
        for (var j = 0; j < 6; ++j) {
            var c = this.colors[j];

            // Repeat each color four times for the four vertices of the face

            for (var i = 0; i < 4; ++i) {
                this.generatedColors = this.generatedColors.concat(c);
            }
        }

        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.cubeVerticesColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.generatedColors), gl.STATIC_DRAW);

        this.cubeVerticesIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.cubeVertexIndices), gl.STATIC_DRAW);

    },

    draw: function(gl) {
        if (!this.cubeVerticesIndexBuffer) {
            this.initBuffers(gl);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesColorBuffer);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.cubeVerticesIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }
}

var Loader = {
    useColors: false,
    randColors: true,

    vertexDim: 0,
    normalDim: 0,
    faceDim: 0,

    verticesBuffer: null,
    normalsBuffer: null,
    colorsBuffer: null,
    facesBuffer: null,


    initBuffers: function(gl) {
        if (!this.useColors) {
            this.model.colors = [];

            if (this.randColors) {
                for (var i = 0; i < this.model.metadata.vertices; ++i) {
                    this.model.colors.push(Math.random());
                    this.model.colors.push(Math.random());
                    this.model.colors.push(Math.random());
                    this.model.colors.push(1.0);
                }
            } else {
                for (var i = 0; i < this.model.metadata.vertices; ++i) {
                    this.model.colors.push(1.0);
                    this.model.colors.push(1.0);
                    this.model.colors.push(1.0);
                    this.model.colors.push(1.0);
                }
            }
            this.model.metadata.colors = this.model.metadata.vertices;
            this.useColors = true;
        }

        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);

        console.log(this.model.vertexNormals.length);
        console.log(this.model.vertices.length);

        this.normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertexNormals), gl.STATIC_DRAW);

        this.colorsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.colors), gl.STATIC_DRAW);

        this.facesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model.faces), gl.STATIC_DRAW);
    },

    load: function(gl, file) {
        var modelJSON;
        $.ajax({
            async: false,
            url: "models/" + file,
            dataType: "text",
            success: function (result) {
                modelJSON = result;
            }
        });
        this.model = JSON.parse(modelJSON);
        var model = this.model;

        if (model.metadata.vertices == 0 || model.metadata.normals == 0 || model.metadata.faces == 0) {
            alert("Model must have vertices, normals and faces.");
            return;
        }

        model.vertexDim = model.vertices.length / model.metadata.vertices;
        model.normalDim = model.normals.length / model.metadata.normals;
        model.faceDim = model.faces.length / model.metadata.faces;

        console.log(model.vertexDim);
        console.log(model.normalDim);
        console.log(model.faceDim);
        if (model.vertexDim != 3 || model.normalDim != 3) {
            alert("Model is corrupt: each vertex, normal and face should be presented by 3 values");
            return undefined;
        }

        return model;
    },

    draw: function(gl) {
        if (this.verticesBuffer === undefined) {
            this.initBuffers(gl);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
        gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer);
        gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, this.model.faces.length, gl.UNSIGNED_SHORT, 0);
    }
}