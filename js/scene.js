function Scene(canvas, gl) {
    this.lightPosition = Vector.create([-100, -100, 100, 1]);
    this.eyePosition = Vector.create([0.0, 100, 300.0, 1]);
    this.objects = [];

    this.mvMatrix = Matrix.I(4);
    this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);
    this.transformations = [];

    this.resetTransformations = function() {
        this.transformations = [];
    };

    this.mvRotateXY = function(angleX, angleY) {
        this.transformations.push(Matrix.RotationX(angleY).ensure4x4());
        this.transformations.push(Matrix.RotationY(angleX).ensure4x4());
    };

    this.mvTranslate = function(v) {
        this.transformations.push(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    };

    this.transform = function() {
        var transformation;
        while (transformation = this.transformations.shift()) {
            this.mvMatrix = this.mvMatrix.x(transformation);
        }
    };

    this.draw = function(canvas, gl) {
        this.transform();
        this.pMatrix = makePerspective(45, canvas.width / canvas.height, 0.1, 1000);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var scene = this;
        this.objects.forEach(function(object) {
            object.draw(gl, scene);
        });
    };
}