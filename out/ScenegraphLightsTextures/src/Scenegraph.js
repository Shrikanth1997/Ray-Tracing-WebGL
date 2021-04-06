define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Scenegraph = void 0;
    class Scenegraph {
        constructor() {
            this.root = null;
            this.meshes = new Map();
            this.nodes = new Map();
            this.textures = new Map();
        }
        dispose() {
            this.renderer.dispose();
        }
        /**
         * Computes and returns the number of lights in this scene graph
         */
        getNumLights() {
            return this.root.getNumLights();
        }
        /**
         * Sets the renderer, and then adds all the meshes to the renderer.
         * This function must be called when the scene graph is complete, otherwise not all of its
         * meshes will be known to the renderer
         * @param renderer The {@link ScenegraphRenderer} object that will act as its renderer
         * @throws Exception
         */
        setRenderer(renderer) {
            this.renderer = renderer;
            //now add all the meshes
            for (let [meshName, mesh] of this.meshes) {
                this.renderer.addMesh(meshName, mesh);
            }
            //now add all the textures
            for (let [name, path] of this.textures) {
                this.renderer.addTexture(name, path);
            }
        }
        /**
         * Set the root of the scenegraph, and then pass a reference to this scene graph object
         * to all its node. This will enable any node to call functions of its associated scene graph
         * @param root
         */
        makeScenegraph(root) {
            this.root = root;
            this.root.setScenegraph(this);
        }
        /**
         * Draw this scene graph. It delegates this operation to the renderer
         * @param modelView
         */
        draw(modelView) {
            if ((this.root != null) && (this.renderer != null)) {
                this.renderer.draw(this.root, modelView);
            }
        }
        addPolygonMesh(meshName, mesh) {
            this.meshes.set(meshName, mesh);
        }
        animate(time) {
            /*    let transform: mat4 = mat4.create();
                mat4.rotate(transform, transform, glMatrix.toRadian(time), vec3.fromValues(0, 1, 0));
                this.nodes.get("box-transform").setAnimationTransform(transform);
        
                transform = mat4.create();
                mat4.rotate(transform, transform, glMatrix.toRadian(30), vec3.fromValues(1, 0, 0));
                mat4.rotate(transform, transform, glMatrix.toRadian(-10 * time), vec3.fromValues(0, 1, 0));
                mat4.translate(transform, transform, vec3.fromValues(100, 0, 0));
                this.nodes.get("aeroplane-transform").setAnimationTransform(transform);
                */
            /*   let transform: mat4 = mat4.create();
               mat4.rotate(transform, transform, glMatrix.toRadian(45 * Math.sin(0.1 * time)), vec3.fromValues(1, 0, 0));
               this.nodes.get("face").setAnimationTransform(transform);
       
               transform = mat4.create();
               mat4.translate(transform, transform, vec3.fromValues(0, 12 + 12 * Math.sin(0.2 * time), 0));
               this.nodes.get("hat").setAnimationTransform(transform);
       */
        }
        addNode(nodeName, node) {
            this.nodes.set(nodeName, node);
        }
        getRoot() {
            return this.root;
        }
        getPolygonMeshes() {
            return this.meshes;
        }
        getNodes() {
            return this.nodes;
        }
        addTexture(textureName, path) {
            this.textures.set(textureName, path);
        }
    }
    exports.Scenegraph = Scenegraph;
});
//# sourceMappingURL=Scenegraph.js.map