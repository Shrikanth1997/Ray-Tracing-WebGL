import { SGNode } from "./SGNode";
import { vec4, mat4, vec3, glMatrix } from "gl-matrix";
import { Scenegraph } from "./Scenegraph";
import { Material } from "%COMMON/Material";
import { Stack } from "%COMMON/Stack";
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { IVertexData } from "%COMMON/IVertexData";
import { Ray3D, HitRecord, Bounds } from "./RayTracing";


/**
 * This node represents the leaf of a scene graph. It is the only type of node that has
 * actual geometry to render.
 * @author Amit Shesh
 */

export class TransformationInfo {

    public center: vec3;
    public radius: number;

    public constructor(){
        this.center = [0,0,0];
        this.radius = 0;
    }

}


export class LeafNode extends SGNode {

    /**
      * The name of the object instance that this leaf contains. All object instances are stored
      * in the scene graph itself, so that an instance can be reused in several leaves
      */
    protected meshName: string;
    /**
     * The material associated with the object instance at this leaf
     */
    protected material: Material;

    protected textureName: string;

    private LeafTransformInfo: TransformationInfo;

    //public boundBox: Bounds;

    public constructor(instanceOf: string, graph: Scenegraph<IVertexData>, name: string) {
        super(graph, name);
        this.meshName = instanceOf;

        this.LeafTransformInfo = new TransformationInfo;
    }


    public setTransformInfo(center: vec3, radius: vec3){

        this.LeafTransformInfo.center = center;
        this.LeafTransformInfo.radius = (radius[0]+radius[1]+radius[2]) / 3;

    }

    /*
	 *Set the material of each vertex in this object
	 */
    public setMaterial(mat: Material): void {
        this.material = mat;
    }

    /**
     * Set texture ID of the texture to be used for this leaf
     * @param name
     */
    public setTextureName(name: string): void {
        this.textureName = name;
    }

    /*
     * gets the material
     */
    public getMaterial(): Material {
        return this.material;
    }

    public clone(): SGNode {
        let newclone: SGNode = new LeafNode(this.meshName, this.scenegraph, this.name);
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
    public draw(context: ScenegraphRenderer, modelView: Stack<mat4>): void {
        if (this.meshName.length > 0) {
            context.drawMesh(this.meshName, this.material, this.textureName, modelView.peek());
        }
    }

    public BVH(context: ScenegraphRenderer, modelView: Stack<mat4>): void
    {
        if(this.meshName.length > 0)
        {
            this.boundBox = context.createBVH(this.meshName, modelView.peek(), this.LeafTransformInfo);
        }
    }

    public intersect(context: ScenegraphRenderer, ray: Ray3D, modelView: Stack<mat4>, isHit: boolean): [boolean, HitRecord] {
        //console.log("Check if transform is correct " + this.LeafTransformInfo.center + ", " + this.LeafTransformInfo.radius);
        let hitr: HitRecord;
        if (this.meshName.length > 0) {
            [isHit,hitr]  = context.intersectNode(this.meshName, ray,  modelView.peek(), isHit, this.LeafTransformInfo, this.material);
        }
        //console.log("Check HIT: " + isHit);
        return [isHit, hitr];
    }
}