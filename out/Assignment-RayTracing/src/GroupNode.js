define(["require", "exports", "./SGNode"], function (require, exports, SGNode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupNode = void 0;
    /**
     * This class represents a group node in the scenegraph. A group node is simply a logical grouping
     * of other nodes. It can have an arbitrary number of children. Its children can be nodes of any type
     * @author Amit Shesh
     */
    class GroupNode extends SGNode_1.SGNode {
        constructor(graph, name) {
            super(graph, name);
            this.children = [];
        }
        /**
         * Searches recursively into its subtree to look for node with specified name.
         * @param name name of node to be searched
         * @return the node whose name this is if it exists within this subtree, null otherwise
         */
        getNode(name) {
            let n = super.getNode(name);
            if (n != null) {
                return n;
            }
            let i = 0;
            let answer = null;
            while ((i < this.children.length) && (answer == null)) {
                answer = this.children[i].getNode(name);
                i++;
            }
            return answer;
        }
        /**
         * Sets the reference to the scene graph object for this node, and then recurses down
         * to children for the same
         * @param graph a reference to the scenegraph object of which this tree is a part
         */
        setScenegraph(graph) {
            super.setScenegraph(graph);
            this.children.forEach(child => child.setScenegraph(graph));
        }
        /**
         * To draw this node, it simply delegates to all its children
         * @param context the generic renderer context {@link ScenegraphRenderer}
         * @param modelView the stack of modelview matrices
         */
        draw(context, modelView) {
            this.children.forEach(child => child.draw(context, modelView));
        }
        /**
         * Makes a deep copy of the subtree rooted at this node
         * @return a deep copy of the subtree rooted at this node
         */
        clone() {
            let newc = [];
            this.children.forEach(child => newc.push(child.clone()));
            let newgroup = new GroupNode(this.scenegraph, "");
            this.children.forEach(child => newgroup.addChild(child));
            return newgroup;
        }
        /**
         * Since a group node is capable of having children, this method overrides the default one
         * in {@link sgraph.AbstractNode} and adds a child to this node
         * @param child
         * @throws IllegalArgumentException this class does not throw this exception
         */
        addChild(child) {
            this.children.push(child);
            child.setParent(this);
        }
        /**
         * Get a list of all its children, for convenience purposes
         * @return a list of all its children
         */
        getChildren() {
            return this.children;
        }
        /**
         * Returns the number of lights in the scene graph rooted at this node
         */
        getNumLights() {
            let numLights = super.getNumLights();
            this.children.forEach((node) => {
                numLights += node.getNumLights();
            });
            return numLights;
        }
        getLights(modelview) {
            let lights = super.getLights(modelview);
            //now get all the lights in children
            this.children.forEach((node) => {
                let l = node.getLights(modelview);
                l.forEach((lgt) => lights.push(lgt));
            });
            return lights;
        }
    }
    exports.GroupNode = GroupNode;
});
//# sourceMappingURL=GroupNode.js.map