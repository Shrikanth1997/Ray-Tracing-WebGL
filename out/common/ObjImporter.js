define(["require", "exports", "./PolygonMesh", "gl-matrix"], function (require, exports, PolygonMesh_1, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjImporter = void 0;
    /**
     * This file contains useful functions to import a mesh in the OBJ file format.
     */
    var ObjImporter;
    (function (ObjImporter) {
        /**
         * Download a mesh stored in the OBJ file format.
         * @param name the name of the mesh
         * @param producer a producer for vertices to store data
         * @param scaleAndCenter boolean function about whether to scale and center the model so that it occupies a cube of unit side centered at the origin
         * @return promise that can be waited on
         */
        /*   export function downloadMesh<VertexType extends IVertexData>(name: string, producer: VertexProducer<VertexType>): Promise<Mesh.PolygonMesh<VertexType>> {
               return new Promise<Mesh.PolygonMesh<VertexType>>((resolve) => {
                   let promise: Promise<Mesh.PolygonMesh<IVertexData>>;
                   let mesh: Mesh.PolygonMesh<VertexType>;
       
                   promise = fetch(name) //fetch the data from this name treating it as a URL
                       .then(response => response.text()) //get the contents as text
                       .then(data => {
                           mesh = importMesh<VertexType>(producer, data, true); //import mesh
                           return mesh; //return the loaded mesh
                       });
       
                   //when promise is resolved, then call the callback with the mesh
                   Promise.resolve(promise).then((mesh: Mesh.PolygonMesh<VertexType>) => {
                       resolve(mesh);
                   });
               });
           } */
        function downloadMesh(name, producer, scaleAndCenter = true) {
            return new Promise((resolve) => {
                let promise;
                let mesh;
                promise = fetch(name) //fetch the data from this name treating it as a URL
                    .then(response => response.text()) //get the contents as text
                    .then(data => {
                    mesh = importMesh(producer, data, scaleAndCenter); //import mesh
                    return mesh; //return the loaded mesh
                });
                //when promise is resolved, then call the callback with the mesh
                Promise.resolve(promise).then((mesh) => {
                    resolve(mesh);
                });
            });
        }
        ObjImporter.downloadMesh = downloadMesh;
        /**
         * This function allows the user to download several polygon meshes, all stored in the OBJ file format. This is a batch-version of the above function.
         * @param nameAndUrl a map of mesh names to URLs (paths)
         * @param producer an object to produce vertices.
         * @param scaleAndCenter boolean function about whether to scale and center the model so that it occupies a cube of unit side centered at the origin
         * @return a promise
         */
        function batchDownloadMesh(nameAndUrl, producer, scaleAndCenter = true) {
            return new Promise((resolve) => {
                let promises = [];
                let meshMap = new Map();
                for (let [n, u] of nameAndUrl) { //n:name, u: URL
                    //create one promise per mesh
                    promises.push(fetch(u) //fetch the URL
                        .then(response => response.text()) //convert contents to string
                        .then(data => {
                        let mesh = importMesh(producer, data, scaleAndCenter); //import the mesh
                        return [n, mesh]; //report a name, mesh pair
                    }));
                }
                //when all promises have been resolved (i.e. when all meshes have been loaded)
                Promise.all(promises).then((list) => {
                    for (let [n, mesh] of list) { //for each (name,mesh) pair in the list
                        meshMap.set(n, mesh); //add to the mesh map
                    }
                    resolve(meshMap); //call the callback with the map of meshes
                });
            });
        }
        ObjImporter.batchDownloadMesh = batchDownloadMesh;
        /**
         * This function parses an OBJ format to import a polygonal mesh
         * @param producer an object used to produce vertices
         * @param contents the contents in OBJ format
         * @param scaleAndCenter whether to scale and center the loaded mesh so that it is centered at the origin and inside a box of side 1
         */
        function importMesh(producer, contents, scaleAndCenter) {
            //helper class
            class IndexTriple {
                constructor(vIndex, tIndex, nIndex) {
                    this.vertexIndex = vIndex;
                    this.textureIndex = tIndex;
                    this.normalIndex = nIndex;
                }
                /**
                 * Generate a hash function that is unique to each triple
                 */
                hash() {
                    return "" + this.vertexIndex + "," + this.textureIndex + "," + this.normalIndex;
                }
            }
            let mesh;
            let vertices;
            let normals;
            let texcoords;
            let indexData;
            let vertexData;
            let meshIndices;
            let i;
            let j;
            let lineno;
            //stores (index_v+index_n+index_t -> index in vertexData)
            let unpacked = new Map();
            vertices = [];
            normals = [];
            texcoords = [];
            meshIndices = [];
            vertexData = [];
            indexData = [];
            //split into lines
            let lines = contents.split(/\r?\n/);
            lineno = 0;
            //for each line
            lines.forEach(line => {
                line = line.trim(); //remove whitespace
                lineno++; //increment line number
                if ((line.length > 0) && (!line.startsWith("#"))) { //it is a non-empty, non-comment line
                    let tokens = line.split(/\s+/); //split by white space
                    switch (tokens[0]) {
                        case "v":
                            { //it is vertex data
                                if ((tokens.length < 4) || (tokens.length > 7))
                                    throw new Error("Line " + lineno + ": Vertex coordinate has an invalid number of values");
                                let v = gl_matrix_1.vec4.create();
                                v[0] = parseFloat(tokens[1]);
                                v[1] = parseFloat(tokens[2]);
                                v[2] = parseFloat(tokens[3]);
                                v[3] = 1.0;
                                if (tokens.length == 5) { //homogeneous coordinate present
                                    let num = parseFloat(tokens[4]);
                                    if (num != 0) {
                                        v[0] /= num;
                                        v[1] /= num;
                                        v[2] /= num;
                                    }
                                }
                                vertices.push(v);
                            }
                            break;
                        case "vn":
                            { //it is a normal vector
                                if (tokens.length != 4)
                                    throw new Error("Line " + lineno + ": Normal has an invalid number of values");
                                let v = gl_matrix_1.vec3.create();
                                v[0] = parseFloat(tokens[1]);
                                v[1] = parseFloat(tokens[2]);
                                v[2] = parseFloat(tokens[3]);
                                gl_matrix_1.vec3.normalize(v, v); //normalize the vector
                                normals.push(gl_matrix_1.vec4.fromValues(v[0], v[1], v[2], 0));
                            }
                            break;
                        case "vt":
                            { //it is a texture coordinate
                                if ((tokens.length < 3) || (tokens.length > 4))
                                    throw new Error("Line " + lineno + ": Texture coordinate has an invalid number of values");
                                let v = gl_matrix_1.vec4.create();
                                v[0] = parseFloat(tokens[1]);
                                v[1] = parseFloat(tokens[2]);
                                v[2] = 0;
                                v[3] = 1;
                                if (tokens.length > 3) {
                                    v[2] = parseFloat(tokens[3]);
                                }
                                texcoords.push(v);
                            }
                            break;
                        case "f":
                            { //this is face data
                                if (tokens.length < 4)
                                    throw new Error("Line " + lineno + ": Face has too few vertices, must be at least 3");
                                tokens.shift(); //remove tokens[0] which is 'f'
                                tokens = triangulate(tokens); //if there are >3 sets, triangulate
                                for (i = 0; i < tokens.length; i++) {
                                    let data = tokens[i].split("/"); //split by /
                                    if ((data.length < 1) && (data.length > 3))
                                        throw new Error("Line " + lineno + ": Face specification has an incorrect number of values");
                                    //in OBJ file format all indices begin at 1, so must subtract 1 here
                                    let vertIndex = parseInt(data[0]) - 1;
                                    let textureIndex = -1;
                                    let normalIndex = -1;
                                    if (data.length > 1) {
                                        if (data[1].length > 0) { //a vertex texture index exists
                                            textureIndex = parseInt(data[1]) - 1;
                                        }
                                        if (data.length > 2) { //a vertex normal index exists
                                            normalIndex = parseInt(data[2]) - 1;
                                        }
                                    }
                                    indexData.push(new IndexTriple(vertIndex, textureIndex, normalIndex));
                                }
                            }
                            break;
                    }
                }
            });
            let normalsPresent = false;
            let texturePresent = false;
            if (normals.length > 0) {
                normalsPresent = true; //content had normals
            }
            if (texcoords.length > 0) {
                texturePresent = true; //content had texture coordinates
            }
            //now make the list of vertices and indices
            indexData.forEach(v => {
                //get the hash
                let hashValue = v.hash();
                let actualIndex = -1;
                if (hashValue in unpacked) {
                    //get the index
                    actualIndex = unpacked.get(hashValue);
                }
                else { //not present, make a new vertex
                    let vertex = producer.produce();
                    vertex.setData("position", [vertices[v.vertexIndex][0], vertices[v.vertexIndex][1], vertices[v.vertexIndex][2]]);
                    if (normalsPresent) {
                        vertex.setData("normal", [normals[v.normalIndex][0], normals[v.normalIndex][1], normals[v.normalIndex][2]]);
                    }
                    if (texturePresent) {
                        vertex.setData("texcoord", [texcoords[v.textureIndex][0], texcoords[v.textureIndex][1], texcoords[v.textureIndex][2]]);
                    }
                    //push into vertexData
                    vertexData.push(vertex);
                    //remember in hash table
                    unpacked.set(hashValue, vertexData.length - 1);
                    actualIndex = vertexData.length - 1;
                }
                //push the index
                meshIndices.push(actualIndex);
            });
            mesh = new PolygonMesh_1.Mesh.PolygonMesh();
            mesh.setVertexData(vertexData);
            mesh.setPrimitives(meshIndices, PolygonMesh_1.Mesh.FaceType.Triangle);
            if (scaleAndCenter) {
                let scaledMesh = new PolygonMesh_1.Mesh.CanonicalMesh(mesh);
                mesh = scaledMesh.getMesh();
            }
            return mesh;
        }
        ObjImporter.importMesh = importMesh;
        function triangulate(faceData) {
            let result = [];
            if (faceData.length <= 3) {
                result = faceData;
            }
            else {
                for (let i = 1; i < faceData.length - 1; i++) {
                    result.push(faceData[0]);
                    result.push(faceData[i]);
                    result.push(faceData[i + 1]);
                }
            }
            return result;
        }
    })(ObjImporter = exports.ObjImporter || (exports.ObjImporter = {}));
});
//# sourceMappingURL=ObjImporter.js.map