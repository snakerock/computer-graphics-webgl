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