define(["require", "exports", "./SGNode"], function (require, exports, SGNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LeafNode = void 0;
    /**
     * This node represents the leaf of a scene graph. It is the only type of node that has
     * actual geometry to render.
     * @author Amit Shesh
     */
    class LeafNode extends SGNode_1.SGNode {
        constructor(instanceOf, graph, name) {
            super(graph, name);
            this.meshName = instanceOf;
        }
        /*
         *Set the material of each vertex in this object
         */
        setMaterial(mat) {
            this.material = mat;
        }
        /**
         * Set texture ID of the texture to be used for this leaf
         * @param name
         */
        setTextureName(name) {
            this.textureName = name;
        }
        /*
         * gets the material
         */
        getMaterial() {
            return this.material;
        }
        clone() {
            let newclone = new LeafNode(this.meshName, this.scenegraph, this.name);
            newclone.setMaterial(this.getMaterial());
            return newclone;
        }
        /**
         * Delegates to the scene graph for rendering. This has two advantages:
         * <ul>
         *     <li>It keeps the leaf light.</li>
         *     <li>It abstracts the actual drawing to the specific implementation of the scene graph renderer</li>
         * </ul>
         * @param context the generic renderer context {@link sgraph.IScenegraphRenderer}
         * @param modelView the stack of modelview matrices
         * @throws IllegalArgumentException
         */
        draw(context, modelView) {
            if (this.meshName.length > 0) {
                context.drawMesh(this.meshName, this.material, this.textureName, modelView.peek());
            }
        }
    }
    exports.LeafNode = LeafNode;
});
//# sourceMappingURL=LeafNode.js.map