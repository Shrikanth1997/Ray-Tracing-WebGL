define(["require", "exports", "./PolygonMesh"], function (require, exports, PolygonMesh_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderableMesh = void 0;
    /**
     * This class represents a WebGL renderable mesh. It takes in a regular triangle mesh, and builds the buffers to render it
     */
    class RenderableMesh {
        /**
         * Create a blank RenderableMesh using a WebGL rendering context and a name
         *
         * @param gl   the WebGLRenderingContext context to be used for all Webgl commands on this
         *             object
         * @param name a name of the object
         */
        constructor(gl, name) {
            this.gl = gl;
            this.vbo = gl.createBuffer();
            this.ibo = gl.createBuffer();
            this.numIndices = 0;
            this.name = name;
            this.offsets = new Map();
            this.shaderVarsToAttribs = new Map();
            this.vertexDataLengths = new Map();
        }
        /**
         * A helper method that sets this object up for rendering
         *
         * @param shaderVarsToAttributeNames a mapping of shader variable -> vertex
         *                                   attributes in the underlying mesh
         * @param mesh                       the underlying polygon mesh
         */
        initMeshForRendering(shaderVarsToAttributeNames, mesh) {
            let j;
            this.shaderVarsToAttribs = shaderVarsToAttributeNames;
            switch (mesh.getFaceType()) {
                case PolygonMesh_1.Mesh.FaceType.Triangle:
                    this.faceType = this.gl.TRIANGLES;
                    break;
                case PolygonMesh_1.Mesh.FaceType.TriangleFan:
                    this.faceType = this.gl.TRIANGLE_FAN;
                    break;
                case PolygonMesh_1.Mesh.FaceType.TriangleStrip:
                    this.faceType = this.gl.TRIANGLE_STRIP;
                    break;
                case PolygonMesh_1.Mesh.FaceType.Lines:
                    this.faceType = this.gl.LINES;
                    break;
                case PolygonMesh_1.Mesh.FaceType.LineStrip:
                    this.faceType = this.gl.LINE_STRIP;
                    break;
                case PolygonMesh_1.Mesh.FaceType.LineLoop:
                    this.faceType = this.gl.LINE_LOOP;
                    break;
            }
            //create buffers
            this.vbo = this.gl.createBuffer();
            this.ibo = this.gl.createBuffer();
            //get a list of all the vertex attributes from the mesh
            let vertexDataList = mesh.getVertexAttributes();
            let primitives = mesh.getIndices();
            //get the indices for the mesh into a buffer
            let indicesArray = new Uint16Array(primitives);
            this.numIndices = indicesArray.length;
            /*
            now put all the vertex attributes in a single array, so that we can copy it over to the vertex buffer. When we convert an IVertexData to a bunch of numbers, we must remember where each attribute starts, because we will need to give it to vertexAttribPointer when drawing
            */
            let floatsPerVertex = 0;
            //for each attribute available in the vertex data:
            for (let [shaderVar, attribName] of this.shaderVarsToAttribs) {
                //the first vertex data will begin at this offset. Required for vertexAttribPointer
                this.offsets.set(attribName, floatsPerVertex);
                //how many floats for this attribute?
                let length = vertexDataList[0].getData(attribName).length;
                //update the number of floats by this amount
                floatsPerVertex += length;
                //remember how many floats for this attribute, Required for vertexAttribPointer
                this.vertexDataLengths.set(attribName, length);
            }
            if (this.shaderVarsToAttribs.size > 1) //if there are multiple attributes per vertex
                this.stride = floatsPerVertex;
            else
                this.stride = 0;
            let vertexDataAsNumbers = [];
            //now generate the array
            vertexDataList.forEach(v => {
                for (let [shaderVar, attribName] of this.shaderVarsToAttribs) {
                    let data = v.getData(attribName);
                    //copy over the floats for this attribute
                    for (j = 0; j < data.length; j++) {
                        vertexDataAsNumbers.push(data[j]);
                    }
                }
            });
            //copy all the data to the vbo
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexDataAsNumbers), this.gl.STATIC_DRAW);
            //copy over the indices to the ibo
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesArray, this.gl.STATIC_DRAW);
        }
        cleanup() {
            this.gl.deleteBuffer(this.vbo);
            this.gl.deleteBuffer(this.ibo);
        }
        /**
         * Draw this mesh. This assumes that the object has been setup for rendering prior to calling
         * this method.
         *
         * @param shaderLocations the map of shader locations from the shader program
         */
        draw(shaderLocations) {
            //bind the buffer for vertex data
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
            //bind the element buffer for index data
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ibo);
            //go through all attributes, use vertexAttribPointer and enable them
            for (let [shaderVar, attribName] of this.shaderVarsToAttribs) {
                /**
                 * shaderVar: the name of the shader variable
                 * attribName: the name of the corresponding vertex attribute in triangle mesh
                 */
                let shaderLocation = shaderLocations.getAttribLocation(shaderVar);
                if (shaderLocation >= 0) {
                    //tell webgl how to interpret the above data
                    this.gl.vertexAttribPointer(shaderLocation //for the attribute that links to this location in shader...
                    , this.vertexDataLengths.get(attribName) //no. of floats per one vertex
                    , this.gl.FLOAT //data in buffer is float-type
                    , false //not normalized, but for FLOAT this parameter has no effect
                    , 4 * this.stride //4 bytes per float
                    , 4 * this.offsets.get(attribName)); //4 bytes per float, beginning here
                    //enable this attribute so that when rendered, this is sent to the vertex shader
                    this.gl.enableVertexAttribArray(shaderLocation);
                }
            }
            //2. execute the "superpower" command
            //this effectively reads the index buffer, grabs the vertex data using
            //the indices and sends them to the shader
            this.gl.drawElements(this.faceType, this.numIndices, this.gl.UNSIGNED_SHORT, 0);
        }
        /*
         *Set the name of this object
         */
        setName(name) {
            this.name = name;
        }
        /*
         *Gets the name of this object
        */
        getName() {
            return this.name;
        }
    }
    exports.RenderableMesh = RenderableMesh;
});
//# sourceMappingURL=RenderableMesh.js.map