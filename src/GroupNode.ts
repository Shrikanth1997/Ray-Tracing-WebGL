import { SGNode } from "./SGNode"
import { Scenegraph } from "./Scenegraph";
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { Stack } from "%COMMON/Stack";
import { mat4, vec4, vec3 } from "gl-matrix";
import { IVertexData } from "%COMMON/IVertexData";
import { Light } from "%COMMON/Light";
import { Ray3D, HitRecord, Bounds } from "./RayTracing";

/**
 * This class represents a group node in the scenegraph. A group node is simply a logical grouping
 * of other nodes. It can have an arbitrary number of children. Its children can be nodes of any type
 * @author Amit Shesh
 */

export class GroupNode extends SGNode {

    /**
     * A list of its children
     */
    protected children: SGNode[];

    //public boundBox: Bounds;

    public constructor(graph: Scenegraph<IVertexData>, name: string) {
        super(graph, name);
        this.children = [];
    }

    /**
     * Searches recursively into its subtree to look for node with specified name.
     * @param name name of node to be searched
     * @return the node whose name this is if it exists within this subtree, null otherwise
     */
    public getNode(name: string): SGNode {
        let n: SGNode = super.getNode(name);
        if (n != null) {
            return n;
        }

        let i: number = 0;
        let answer: SGNode = null;

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
    public setScenegraph(graph: Scenegraph<IVertexData>): void {
        super.setScenegraph(graph);
        this.children.forEach(child => child.setScenegraph(graph));
    }

    /**
     * To draw this node, it simply delegates to all its children
     * @param context the generic renderer context {@link ScenegraphRenderer}
     * @param modelView the stack of modelview matrices
     */
    public draw(context: ScenegraphRenderer, modelView: Stack<mat4>): void {
        this.children.forEach(child => child.draw(context, modelView));
    }

    public BVH(context: ScenegraphRenderer, modelView: Stack<mat4>): void
    {
        let first: boolean = true;
        for(let i: number = 0; i < this.children.length; i++)
        {
            this.children[i].BVH(context, modelView);
            
            if(first == true)
            {
                this.boundBox = new Bounds(this.children[i].boundBox.min, this.children[i].boundBox.max);
                first = false;
            }
            else
            {
                this.boundBox.expand(this.children[i].boundBox.min, this.children[i].boundBox.max); 
            }

        }

        //console.log("NodeBounds Min: " + this.boundBox.min[0], this.boundBox.min[1], this.boundBox.min[2]);
        //console.log("Nodeounds Max: " + this.boundBox.max[0], this.boundBox.max[1], this.boundBox.max[2]);
    }

    public intersect(context: ScenegraphRenderer, ray: Ray3D, modelView: Stack<mat4>, isHit: boolean): [boolean, HitRecord] {
        let hits: boolean;
        let hitr: HitRecord;
        let firstHit: boolean = true;
        hits = false;

        //console.log ("ray: " + ray + " output: " + this.boundBox.intersect(ray));
        if(this.boundBox.intersect(ray) == false)
            return [false, hitr];
            
            //return [false, new HitRecord(0, vec4.create(), vec4.create())];

        for(let i: number = 0; i < this.children.length; i++)
        {
            let hits_temp: boolean;
            let hitr_temp: HitRecord;

            [hits_temp,hitr_temp] = this.children[i].intersect(context, ray, modelView, isHit);
            if(hits_temp == true)
            {
                //if(firstHit == true)
                {
                    hits = true;
                    hitr = hitr_temp;
                    firstHit = false;
                }
                /*else{
                    // Choose the closest hit
                    if((hitr_temp.rayT < hitr.rayT) )
                    {
                        hits = true;
                        hitr = hitr_temp;
                    }
                }*/

            }
        }
        //this.children.forEach(child => [hits,hitr] = child.intersect(context, ray, modelView, isHit));

        return [hits, hitr];
    }

    /**
     * Makes a deep copy of the subtree rooted at this node
     * @return a deep copy of the subtree rooted at this node
     */
    public clone(): SGNode {
        let newc: SGNode[] = [];

        this.children.forEach(child => newc.push(child.clone()));

        let newgroup: GroupNode = new GroupNode(this.scenegraph, "");

        this.children.forEach(child => newgroup.addChild(child));
        return newgroup;
    }

    /**
     * Since a group node is capable of having children, this method overrides the default one
     * in {@link sgraph.AbstractNode} and adds a child to this node
     * @param child
     * @throws IllegalArgumentException this class does not throw this exception
     */
    public addChild(child: SGNode): void {
        this.children.push(child);
        child.setParent(this);
    }

    /**
     * Get a list of all its children, for convenience purposes
     * @return a list of all its children
     */

    public getChildren(): SGNode[] {
        return this.children;
    }

    /**
     * Returns the number of lights in the scene graph rooted at this node
     */
    public getNumLights(): number {
        let numLights: number = super.getNumLights();

        this.children.forEach((node: SGNode) => {
            numLights += node.getNumLights();
        });
        return numLights;
    }

    public getLights(modelview: Stack<mat4>): Light[] {
        let lights: Light[] = super.getLights(modelview);
        //now get all the lights in children
        this.children.forEach((node: SGNode) => {
            let l: Light[] = node.getLights(modelview);
            l.forEach((lgt: Light) => lights.push(lgt));
        });
        return lights;
    }
}