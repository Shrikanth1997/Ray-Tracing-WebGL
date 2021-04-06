define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mesh = void 0;
    var Mesh;
    (function (Mesh) {
        let FaceType;
        (function (FaceType) {
            FaceType[FaceType["Triangle"] = 0] = "Triangle";
            FaceType[FaceType["TriangleFan"] = 1] = "TriangleFan";
            FaceType[FaceType["TriangleStrip"] = 2] = "TriangleStrip";
            FaceType[FaceType["Lines"] = 3] = "Lines";
            FaceType[FaceType["LineStrip"] = 4] = "LineStrip";
            FaceType[FaceType["LineLoop"] = 5] = "LineLoop";
        })(FaceType = Mesh.FaceType || (Mesh.FaceType = {}));
        ;
        /**
         * This class represents a triangle mesh. It stores vertex positions, normals and texture
         * coordinates. It also stores the indices of the vertex that make triangles, three at a time.
         */
        class PolygonMesh {
            constructor() {
                this.vertexData = [];
                this.indices = [];
                this.faceType = FaceType.Triangle;
                this.minBounds = gl_matrix_1.vec4.create();
                this.maxBounds = gl_matrix_1.vec4.create();
            }
            getFaceType() {
                return this.faceType;
            }
            getNumIndices() {
                return this.indices.length;
            }
            getVertexCount() {
                return this.vertexData.length;
            }
            getMinimumBounds() {
                return gl_matrix_1.vec4.clone(this.minBounds);
            }
            getMaximumBounds() {
                return gl_matrix_1.vec4.clone(this.maxBounds);
            }
            getVertexAttributes() {
                return this.vertexData;
            }
            getIndices() {
                return this.indices;
            }
            setVertexData(vp) {
                this.vertexData = vp;
                this.computeBoundingBox();
            }
            setPrimitives(t, faceType) {
                this.indices = t;
                this.faceType = faceType;
            }
            /**
             * Compute the bounding box of this polygon mesh, if there is position data
             */
            computeBoundingBox() {
                let j;
                if (this.vertexData.length <= 0)
                    return;
                if (!this.vertexData[0].hasData("position")) {
                    return;
                }
                let positions = [];
                for (let v of this.vertexData) {
                    let data = v.getData("position");
                    let pos = gl_matrix_1.vec4.fromValues(0, 0, 0, 1);
                    for (let i = 0; i < data.length; i++) {
                        pos[i] = data[i];
                    }
                    positions.push(pos);
                }
                this.minBounds = gl_matrix_1.vec4.clone(positions[0]);
                this.maxBounds = gl_matrix_1.vec4.clone(positions[0]);
                for (j = 0; j < positions.length; j++) {
                    let p = positions[j];
                    for (let i = 0; i < 3; i++) {
                        if (p[i] < this.minBounds[i]) {
                            this.minBounds[i] = p[i];
                        }
                        if (p[i] > this.maxBounds[i]) {
                            this.maxBounds[i] = p[i];
                        }
                    }
                }
            }
            /**
             * Compute vertex normals in this polygon mesh using Newell's method, if
             * position data exists
             */
            computeNormals() {
                let i, j, k;
                if (this.vertexData.length <= 0)
                    return;
                if (!this.vertexData[0].hasData("position")) {
                    return;
                }
                if (!this.vertexData[0].hasData("normal"))
                    return;
                let positions = [];
                this.vertexData.forEach(v => {
                    let data = v.getData("position");
                    let pos = gl_matrix_1.vec4.fromValues(0, 0, 0, 1);
                    for (let i = 0; i < data.length; i++) {
                        pos[i] = data[i];
                    }
                    positions.push(pos);
                });
                let normals = [];
                for (let i = 0; i < positions.length; i++) {
                    normals.push(gl_matrix_1.vec4.fromValues(0, 0, 0, 0));
                }
                for (let i = 0; i < this.indices.length; i += 3) {
                    let norm = gl_matrix_1.vec3.fromValues(0, 0, 0);
                    //compute the normal of this triangle
                    let v = [0, 0, 0];
                    for (let k = 0; k < 3; k++) {
                        v[k] = this.indices[i + k];
                    }
                    //the newell's method to calculate normal
                    for (let k = 0; k < 3; k++) {
                        for (let l = 0; l < 3; l++) {
                            norm[l] +=
                                (positions[v[k]][(l + 1) % 3] - positions[v[(k + 1) % 3]][(l + 1) % 3])
                                    * (positions[v[k]][(l + 2) % 3] + positions[v[(k + 1) % 3]][(l + 2) % 3]);
                        }
                    }
                    gl_matrix_1.vec3.normalize(norm, norm);
                    for (k = 0; k < 3; k++) {
                        normals[v[k]] = gl_matrix_1.vec4.add(normals[v[k]], normals[v[k]], gl_matrix_1.vec4.fromValues(norm[0], norm[1], norm[2], 0));
                    }
                }
                for (i = 0; i < normals.length; i++) {
                    let n = gl_matrix_1.vec3.fromValues(normals[i][0], normals[i][1], normals[i][2]);
                    gl_matrix_1.vec3.normalize(n, n);
                    normals[i] = gl_matrix_1.vec4.fromValues(n[0], n[1], n[2], 0);
                }
                for (i = 0; i < this.vertexData.length; i++) {
                    this.vertexData[i].setData("normal", [normals[i][0], normals[i][1], normals[i][2]]);
                }
            }
            /**
             * Convert this mesh to wireframe
             */
            convertToWireframe() {
                let result = new PolygonMesh();
                let i;
                result.setVertexData(this.vertexData);
                let newIndices = [];
                switch (this.faceType) {
                    case FaceType.Triangle:
                        for (i = 0; i < this.indices.length; i += 3) {
                            newIndices.push(this.indices[i]);
                            newIndices.push(this.indices[i + 1]);
                            newIndices.push(this.indices[i + 1]);
                            newIndices.push(this.indices[i + 2]);
                            newIndices.push(this.indices[i + 2]);
                            newIndices.push(this.indices[i]);
                        }
                        break;
                    case FaceType.TriangleFan:
                        for (i = 1; i < this.indices.length - 1; i += 1) {
                            newIndices.push(this.indices[0]);
                            newIndices.push(this.indices[i]);
                            newIndices.push(this.indices[i]);
                            newIndices.push(this.indices[i + 1]);
                            newIndices.push(this.indices[0]);
                            newIndices.push(this.indices[i + 1]);
                        }
                        break;
                    case FaceType.TriangleStrip:
                        for (i = 0; i < this.indices.length - 2; i++) {
                            newIndices.push(this.indices[i]);
                            newIndices.push(this.indices[i + 1]);
                            newIndices.push(this.indices[i + 1]);
                            newIndices.push(this.indices[i + 2]);
                            newIndices.push(this.indices[i + 2]);
                            newIndices.push(this.indices[i]);
                        }
                        break;
                }
                result.setPrimitives(newIndices, FaceType.Lines);
                return result;
            }
        }
        Mesh.PolygonMesh = PolygonMesh;
        /**
         * These classes are used in conjunction with the webgl-obj-loader package, imported above. These classes add extra functionality to the mesh from that package
         */
        /**
         * This class represents a decorator for meshes. Classes that extend this one can add additional functionality to meshes
         */
        class DecoratedMesh {
            constructor(m) {
                this.mesh = m;
            }
            getMesh() {
                return this.mesh;
            }
        }
        Mesh.DecoratedMesh = DecoratedMesh;
        /**
         * This decorater class resizes a mesh so that it occupies a cube of side 1 centered at the origin.
         * This is useful because the scales and positions of different meshes loaded from OBJ files are not standardized, so transforming them is tricky. This class will make them of a "canonical" size.
         */
        class CanonicalMesh extends DecoratedMesh {
            constructor(m) {
                super(m);
                this.resizeAndCenter();
            }
            resizeAndCenter() {
                let vertexData = this.mesh.getVertexAttributes();
                if (this.mesh.getVertexCount() < 3) {
                    return;
                }
                //find the center and dimensions of the mesh
                let center = gl_matrix_1.vec3.fromValues(0, 0, 0);
                let minimum = gl_matrix_1.vec3.fromValues(vertexData[0].getData("position")[0], vertexData[0].getData("position")[1], vertexData[0].getData("position")[2]);
                let maximum = gl_matrix_1.vec3.fromValues(minimum[0], minimum[1], minimum[2]);
                let i, j;
                let dimension = vertexData[0].getData("position").length;
                vertexData.forEach(vertex => {
                    let data = vertex.getData("position");
                    for (i = 0; i < data.length; i++) {
                        if (data[i] < minimum[i]) {
                            minimum[i] = data[i];
                        }
                        if (data[i] > maximum[i]) {
                            maximum[i] = data[i];
                        }
                    }
                });
                gl_matrix_1.vec3.add(center, minimum, maximum);
                gl_matrix_1.vec3.scale(center, center, 0.5);
                //move to the center, and scale to bring it within a box of [-1,1] in all three dimensions
                let longest = Math.max(maximum[0] - minimum[0], maximum[1] - minimum[1], maximum[2] - minimum[2]);
                let transform = gl_matrix_1.mat4.create();
                gl_matrix_1.mat4.scale(transform, transform, gl_matrix_1.vec3.fromValues(1 / longest, 1 / longest, 1 / longest));
                gl_matrix_1.mat4.translate(transform, transform, gl_matrix_1.vec3.negate(center, center));
                for (i = 0; i < vertexData.length; i++) {
                    let data = vertexData[i].getData("position");
                    let p = gl_matrix_1.vec4.fromValues(data[0], data[1], data[2], 1);
                    gl_matrix_1.vec4.transformMat4(p, p, transform);
                    vertexData[i].setData("position", [p[0], p[1], p[2], p[3]]);
                }
            }
        }
        Mesh.CanonicalMesh = CanonicalMesh;
    })(Mesh = exports.Mesh || (exports.Mesh = {}));
});
//# sourceMappingURL=PolygonMesh.js.map