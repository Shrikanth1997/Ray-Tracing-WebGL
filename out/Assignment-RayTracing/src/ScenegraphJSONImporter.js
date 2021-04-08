define(["require", "exports", "./Scenegraph", "./GroupNode", "%COMMON/ObjImporter", "./TransformNode", "gl-matrix", "./LeafNode", "%COMMON/Material", "%COMMON/Light"], function (require, exports, Scenegraph_1, GroupNode_1, ObjImporter_1, TransformNode_1, gl_matrix_1, LeafNode_1, Material_1, Light_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ScenegraphJSONImporter = void 0;
    var ScenegraphJSONImporter;
    (function (ScenegraphJSONImporter) {
        let translateBy;
        let scaleBy;
        /**
         * This function parses a scenegraph specified in JSON format, and produces a scene graph
         * @param producer the vertex producer to load all the meshes used in the scene graph
         * @param contents the JSON string
         * @return a promise of a scene graph. The caller waits for the promise
         */
        function importJSON(producer, contents) {
            return new Promise((resolve, reject) => {
                let jsonTree = JSON.parse(contents);
                let scenegraph = new Scenegraph_1.Scenegraph();
                let root;
                let scaleInstances = true;
                if (!("instances" in jsonTree)) {
                    throw new Error("No meshes in the scene graph!");
                }
                if ("scaleinstances" in jsonTree) {
                    if (jsonTree["scaleinstances"] == "false")
                        scaleInstances = false;
                }
                handleInstances(scenegraph, jsonTree["instances"], scaleInstances, producer)
                    .then((scenegraph) => {
                    if (!("root" in jsonTree)) {
                        throw new Error("No root in the scene graph!");
                    }
                    if ("images" in jsonTree) {
                        scenegraph = handleTextures(scenegraph, jsonTree["images"]);
                    }
                    root = handleNode(scenegraph, jsonTree["root"]);
                    scenegraph.makeScenegraph(root);
                    resolve(scenegraph);
                });
            });
        }
        ScenegraphJSONImporter.importJSON = importJSON;
        function getTransformInfo(center, radius) {
            return [center, radius];
        }
        ScenegraphJSONImporter.getTransformInfo = getTransformInfo;
        function handleNode(scenegraph, obj) {
            let result = null;
            if (!("type" in obj)) {
                throw new Error("No type of node!");
            }
            if ("name" in obj) {
                console.log("Processing: " + obj["name"]);
            }
            switch (obj["type"]) {
                case "transform":
                    result = handleTransformNode(scenegraph, obj);
                    break;
                case "group":
                    result = handleGroupNode(scenegraph, obj);
                    break;
                case "object":
                    result = handleLeafNode(scenegraph, obj);
                    break;
                default:
                    throw new Error("Unknown node type");
            }
            return result;
        }
        ScenegraphJSONImporter.handleNode = handleNode;
        function handleTransformNode(scenegraph, obj) {
            let result;
            let nodeName = "t";
            let transform = gl_matrix_1.mat4.create();
            if ("name" in obj) {
                nodeName = obj["name"];
            }
            result = new TransformNode_1.TransformNode(scenegraph, nodeName);
            if (!("child" in obj)) {
                throw new Error("No child for a transform node");
            }
            if (!("transform" in obj)) {
                throw new Error("No transform property for a transform node");
            }
            for (let op of (Object)(obj["transform"])) {
                if ("translate" in op) {
                    let values = convertToArray(op["translate"]);
                    if (values.length != 3) {
                        throw new Error("3 values needed for translate");
                    }
                    translateBy = gl_matrix_1.vec3.fromValues(values[0], values[1], values[2]);
                    gl_matrix_1.mat4.translate(transform, transform, translateBy);
                }
                else if ("scale" in op) {
                    let values = convertToArray(op["scale"]);
                    if (values.length != 3) {
                        throw new Error("3 values needed for scale");
                    }
                    scaleBy = gl_matrix_1.vec3.fromValues(values[0], values[1], values[2]);
                    gl_matrix_1.mat4.scale(transform, transform, scaleBy);
                }
                else if ("rotate" in op) {
                    let values = convertToArray(op["rotate"]);
                    if (values.length != 4) {
                        throw new Error("4 values needed for rotate");
                    }
                    let rotateAngle = values[0];
                    let rotateAxis = gl_matrix_1.vec3.fromValues(values[1], values[2], values[3]);
                    gl_matrix_1.mat4.rotate(transform, transform, gl_matrix_1.glMatrix.toRadian(rotateAngle), rotateAxis);
                }
            }
            result.addChild(handleNode(scenegraph, obj["child"]));
            result.setTransform(transform);
            if ("lights" in obj) {
                for (let op of (Object)(obj["lights"])) {
                    let l = handleLight(op);
                    result.addLight(l);
                }
            }
            return result;
        }
        ScenegraphJSONImporter.handleTransformNode = handleTransformNode;
        function handleLight(obj) {
            let l = new Light_1.Light();
            if ("ambient" in obj) {
                let values = convertToArray(obj["ambient"]);
                if (values.length != 3) {
                    throw new Error("3 values needed for ambient");
                }
                l.setAmbient(values);
            }
            if ("diffuse" in obj) {
                let values = convertToArray(obj["diffuse"]);
                if (values.length != 3) {
                    throw new Error("3 values needed for diffuse");
                }
                l.setDiffuse(values);
            }
            if ("specular" in obj) {
                let values = convertToArray(obj["specular"]);
                if (values.length != 3) {
                    throw new Error("3 values needed for specular");
                }
                l.setSpecular(values);
            }
            if ("position" in obj) {
                let values = convertToArray(obj["position"]);
                if (values.length != 4) {
                    throw new Error("4 values needed for position");
                }
                if (values[3] != 0) {
                    l.setPosition(values);
                }
                else {
                    l.setDirection(values);
                }
            }
            if ("direction" in obj) {
                let values = convertToArray(obj["direction"]);
                if (values.length != 3) {
                    throw new Error("3 values needed for direction");
                }
                l.setDirection(values);
            }
            if ("spotdirection" in obj) {
                let values = convertToArray(obj["spotdirection"]);
                if (values.length != 4) {
                    throw new Error("4 values needed for spot direction");
                }
                l.setSpotDirection(values);
            }
            if ("spotcutoff" in obj) {
                let value = parseFloat(obj["spotcutoff"]);
                l.setSpotAngle(value);
            }
            return l;
        }
        ScenegraphJSONImporter.handleLight = handleLight;
        function handleMaterial(obj) {
            let mat = new Material_1.Material();
            if ("ambient" in obj) {
                let values = convertToArray(obj["ambient"]);
                console.log(values);
                if (values.length != 4) {
                    throw new Error("4 values needed for ambient");
                }
                mat.setAmbient(values);
            }
            if ("diffuse" in obj) {
                let values = convertToArray(obj["diffuse"]);
                if (values.length != 4) {
                    throw new Error("4 values needed for diffuse");
                }
                mat.setDiffuse(values);
            }
            if ("specular" in obj) {
                let values = convertToArray(obj["specular"]);
                if (values.length != 4) {
                    throw new Error("4 values needed for specular");
                }
                mat.setSpecular(values);
            }
            if ("emissive" in obj) {
                let values = convertToArray(obj["emissive"]);
                if (values.length != 4) {
                    throw new Error("4 values needed for emissive");
                }
                mat.setEmission(values);
            }
            if ("shininess" in obj) {
                let value = parseFloat(obj["shininess"]);
                mat.setShininess(value);
            }
            if ("absorption" in obj) {
                let value = parseFloat(obj["absorption"]);
                mat.setAbsorption(value);
            }
            if ("reflection" in obj) {
                let value = parseFloat(obj["reflection"]);
                mat.setReflection(value);
            }
            if ("transparency" in obj) {
                let value = parseFloat(obj["transparency"]);
                mat.setTransparency(value);
            }
            if ("refractive_index" in obj) {
                let value = parseFloat(obj["refractive_index"]);
                mat.setRefractiveIndex(value);
            }
            return mat;
        }
        ScenegraphJSONImporter.handleMaterial = handleMaterial;
        function convertToArray(obj) {
            let result = [];
            for (let n in obj) {
                result.push(parseFloat(obj[n]));
            }
            return result;
        }
        ScenegraphJSONImporter.convertToArray = convertToArray;
        function handleGroupNode(scenegraph, obj) {
            let result;
            let nodeName = "g";
            if ("name" in obj) {
                nodeName = obj["name"];
            }
            result = new GroupNode_1.GroupNode(scenegraph, nodeName);
            for (let child of obj["children"]) {
                let node = handleNode(scenegraph, child);
                result.addChild(node);
            }
            if ("lights" in obj) {
                for (let op of (Object)(obj["lights"])) {
                    let l = handleLight(op);
                    result.addLight(l);
                }
            }
            return result;
        }
        ScenegraphJSONImporter.handleGroupNode = handleGroupNode;
        function handleLeafNode(scenegraph, obj) {
            let result;
            let nodeName = "g";
            if ("name" in obj) {
                nodeName = obj["name"];
            }
            let material = new Material_1.Material(); //all black by default
            result = new LeafNode_1.LeafNode(obj["instanceof"], scenegraph, nodeName);
            if ("material" in obj) {
                material = handleMaterial(obj["material"]);
            }
            result.setTransformInfo(translateBy, scaleBy);
            result.setMaterial(material);
            if ("texture" in obj) {
                let textureName = obj["texture"];
                result.setTextureName(textureName);
            }
            else {
                result.setTextureName("white");
            }
            if ("lights" in obj) {
                for (let op of (Object)(obj["lights"])) {
                    let l = handleLight(op);
                    result.addLight(l);
                }
            }
            return result;
        }
        ScenegraphJSONImporter.handleLeafNode = handleLeafNode;
        function handleInstances(scenegraph, obj, scaleAndCenter, producer) {
            return new Promise((resolve) => {
                let nameUrls = new Map();
                for (let n of Object.keys(obj)) {
                    let path = obj[n]["path"];
                    nameUrls.set(obj[n]["name"], path);
                }
                //import them
                ObjImporter_1.ObjImporter.batchDownloadMesh(nameUrls, producer, scaleAndCenter)
                    .then((meshMap) => {
                    for (let [n, mesh] of meshMap) {
                        scenegraph.addPolygonMesh(n, mesh);
                    }
                    resolve(scenegraph);
                });
            });
        }
        ScenegraphJSONImporter.handleInstances = handleInstances;
        function handleTextures(scenegraph, obj) {
            for (let n of Object.keys(obj)) {
                let path = obj[n]["path"];
                scenegraph.addTexture(obj[n]["name"], obj[n]["path"]);
            }
            return scenegraph;
        }
        ScenegraphJSONImporter.handleTextures = handleTextures;
    })(ScenegraphJSONImporter = exports.ScenegraphJSONImporter || (exports.ScenegraphJSONImporter = {}));
});
//# sourceMappingURL=ScenegraphJSONImporter.js.map