define(["require", "exports", "gl-matrix", "%COMMON/Light"], function (require, exports, gl_matrix_1, Light_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SGNode = void 0;
    /**
     * This class represents a basic node of a scene graph.
     */
    class SGNode {
        constructor(graph, name) {
            this.parent = null;
            this.lights = [];
            this.scenegraph = graph;
            this.setName(name);
        }
        addLight(l) {
            this.lights.push(l);
        }
        getNumLights() {
            return this.lights.length;
        }
        getLights(modelview) {
            let lights = [];
            //first add all lights in this node
            this.lights.forEach((l) => {
                let light = new Light_1.Light();
                light.setAmbient(l.getAmbient());
                light.setDiffuse(l.getDiffuse());
                light.setSpecular(l.getSpecular());
                light.setSpotAngle(l.getSpotCutoff());
                //transform position and spot direction
                let v = l.getPosition();
                gl_matrix_1.vec4.transformMat4(v, v, modelview.peek());
                if (v[3] != 0) {
                    light.setPosition([v[0], v[1], v[2]]);
                }
                else {
                    light.setDirection([v[0], v[1], v[2]]);
                }
                v = l.getSpotDirection();
                gl_matrix_1.vec4.transformMat4(v, v, modelview.peek());
                light.setSpotDirection(gl_matrix_1.vec3.fromValues(v[0], v[1], v[2]));
                lights.push(light);
            });
            return lights;
        }
        /**
         * By default, this method checks only itself. Nodes that have children should override this
         * method and navigate to children to find the one with the correct name
         * @param name name of node to be searched
         * @return the node whose name this is, null otherwise
         */
        getNode(name) {
            if (this.name == name) {
                return this;
            }
            return null;
        }
        /**
         * Sets the parent of this node
         * @param parent the node that is to be the parent of this node
         */
        setParent(parent) {
            this.parent = parent;
        }
        /**
         * Sets the scene graph object whose part this node is and then adds itself
         * to the scenegraph (in case the scene graph ever needs to directly access this node)
         * @param graph a reference to the scenegraph object of which this tree is a part
         */
        setScenegraph(graph) {
            this.scenegraph = graph;
            graph.addNode(this.name, this);
        }
        /**
         * Sets the name of this node
         * @param name the name of this node
         */
        setName(name) {
            this.name = name;
        }
        /**
         * Gets the name of this node
         * @return the name of this node
         */
        getName() {
            return this.name;
        }
        setTransform(transform) {
            throw new Error("Not supported");
        }
        setAnimationTransform(transform) {
            throw new Error("Not supported");
        }
        ;
        setMaterial(mat) {
            throw new Error("Not supported");
        }
        getMaterial() {
            throw new Error("Not supported");
        }
    }
    exports.SGNode = SGNode;
});
//# sourceMappingURL=SGNode.js.map