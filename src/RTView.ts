import { Stack } from "%COMMON/Stack"
import { vec4, mat4, vec3, glMatrix } from "gl-matrix";
import { Ray3D, HitRecord } from "./RayTracing";
import { Scenegraph } from "./Scenegraph";
import { VertexPNT, VertexPNTProducer } from "./VertexPNT";
import { Light } from "%COMMON/Light"

export class RTView {
    private canvas: HTMLCanvasElement;
    private modelview: Stack<mat4>;
    private width: number;
    private height: number;
    public imageData: ImageData;

    public colorsArray: Array<number>;

    public check: number;

    public scenegraph: Scenegraph<VertexPNT>;

    constructor(check: number) {
        this.canvas = <HTMLCanvasElement>document.querySelector("#raytraceCanvas");
        if (!this.canvas) {
            console.log("Failed to retrieve the <canvas> element");
            return;
        }
        //button clicks
        let button: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#savebutton");
        button.addEventListener("click", ev => this.saveCanvas());
        this.modelview = new Stack<mat4>();

        this.width = Number(this.canvas.getAttribute("width"));
        this.height = Number(this.canvas.getAttribute("height"));
        this.imageData = this.canvas.getContext('2d'). createImageData(this.width, this.height);

        this.check = check;

        this.scenegraph = null;

        this.colorsArray = new Array<number>(this.width*this.height);
    }

    private saveCanvas(): void {
        let link = document.createElement('a');
        link.href = this.canvas.toDataURL('image/png');
        link.download = "result.png";
        link.click();
    }

    public fillCanvas(): void {
        
        let width: number = Number(this.canvas.getAttribute("width"));
        let height: number = Number(this.canvas.getAttribute("height"));
        let imageData: ImageData = this.canvas.getContext('2d'). createImageData(width, height);

        for (let i: number = 0; i < height; i++) {
            for (let j: number = 0; j < width; j++) {
                imageData.data[4 * (i * width + j)] = 0;//Math.random() * 255;
                imageData.data[4 * (i * width + j) + 1] = 100;//Math.random() * 255;
                imageData.data[4 * (i * width + j) + 2] = 0;//Math.random() * 255;
                imageData.data[4 * (i * width + j) + 3] = 255;
            }
        }
        this.canvas.getContext('2d').putImageData(imageData, 0, 0);

        let context: CanvasRenderingContext2D = this.canvas.getContext('2d')
        context.fillStyle = 'red';
        //context.fillRect(100, 100, 400, 400);
    }

    public rayTrace(): void{

        // modelView matrix
        while (!this.modelview.isEmpty())
            this.modelview.pop();

        this.modelview.push(mat4.create());
        this.modelview.push(mat4.clone(this.modelview.peek()));
        let eye: vec3 = vec3.fromValues(0, 0, -50);
        mat4.lookAt(this.modelview.peek(), eye, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        let H: number = this.height;
        let W: number = this.width;
    
        let focalLen: number = 1;
        let origin: vec4 = vec4.fromValues(0, 0, 0, 1);
        // Loop over all the pixels

        if(this.scenegraph != null)
        {

            let index_r: number = 0;
            let index_c: number = 0;
            
            let lights: Light[] = this.scenegraph.getLights(this.modelview);
            this.scenegraph.BVH(this.modelview);
            //console.log("Lights: " + lights[0].getAmbient());

            for(let y: number =0;y<=H;y=y+1){
                for(let x: number=0;x<=W;x=x+1){
                    let Sv: vec4 = [0,0,0,1];
                    let V: vec4 = [x-W/2, y-H/2, (-H/2)/Math.tan(glMatrix.toRadian(30)),0];
                    let ray: Ray3D = new Ray3D(Sv, V);

                    let ind_r: number = H-y;

                    let color: vec4 = vec4.create();
                    let rayHit: HitRecord;
                    let isHit: boolean ;
                    [isHit, rayHit] = this.rayCast(ray, this.modelview);

                    if(isHit==true)
                    {
                        //console.log("hit");
                        let col: vec4 = vec4.scale(vec4.create(),this.RTShader(ray, rayHit, this.modelview, lights),255);
                        //let col: vec3 = this.shadeColor(rayHit, modelView, lights)
                        color = [col[0],col[1],col[2],255];
                        //return [100,50,150, 0];
                        
                    }
                    else{
                        //console.log("NO hit");
                        color = [0.9,0.9,0.7,1];
                    }

                    this.imageData.data[4 * (ind_r * W + x)] = color[0];//Math.random() * 255;
                    this.imageData.data[4 * (ind_r * W + x) + 1] = color[1];//Math.random() * 255;
                    this.imageData.data[4 * (ind_r * W + x) + 2] = color[2];//Math.random() * 255;
                    this.imageData.data[4 * (ind_r * W + x) + 3] = 255;

                    //console.log("COLOR: " + color);
                }
            }

            console.log(" =================== Tracing DONE ===============");
            this.canvas.getContext('2d').putImageData(this.imageData, 0, 0);
            //this.fillCanvas();
        }
        
    }

    public rayCast(ray: Ray3D, modelView: Stack<mat4>): [boolean, HitRecord]
    {
       
        //console.log("Reached cast " + this.scenegraph);

        let rayHit: HitRecord;
        let isHit: boolean ;
        if(this.scenegraph != null)
        {
            //console.log("RTView scenegraph is not null " + this.scenegraph.intersect(ray, modelView));
            [isHit,rayHit] = this.scenegraph.intersect(ray, modelView);
            return [isHit, rayHit];
            //console.log("Intersection: " + rayHit.intersection);
        }

        return [false, rayHit];
    }


    public reflect(v: vec3, n: vec3): vec3 {    
        return vec3.subtract(vec3.create(), v , vec3.scale(vec3.create(), n, 2*vec3.dot(v,n)));
    }


    public RTShader(ray: Ray3D, rayHit: HitRecord, modelview: Stack<mat4>, light: Light[] ): vec4 {

        
        // Pass in these values
        let fNormal:vec3 = [rayHit.normalHit[0],rayHit.normalHit[1],rayHit.normalHit[2]];
        let fPosition_temp:vec4 = vec4.add(vec4.create(), ray.position, vec4.scale(vec4.create(), ray.direction, rayHit.rayT));//[rayHit.intersection[0],rayHit.intersection[1],rayHit.intersection[2]];
        let fTexCoord:vec3;
        let fPosition: vec3 = [fPosition_temp[0], fPosition_temp[1], fPosition_temp[2]];
        
        //console.log("normals: " + fNormal);
        
        let lightVec:vec3 = vec3.create();
        let lightVec_noNorm:vec3 = vec3.create();
        let viewVec:vec3= vec3.create();
        let reflectVec:vec3= vec3.create();
        let normalView:vec3= vec3.create();
        let ambient:vec3= vec3.create(),diffuse:vec3= vec3.create(),specular:vec3= vec3.create();
        let nDotL: number,rDotV: number;
        
        
        let result: vec4 = [0,0,0,1];
        let numLights: number = light.length;
        

        for (let i=0;i<numLights;i++)
        {
                    
                lightVec = vec3.normalize(lightVec, vec3.subtract(vec3.create(),[light[i].getPosition()[0], light[i].getPosition()[1], light[i].getPosition()[2]], fPosition));
                lightVec_noNorm = vec3.subtract(vec3.create(),[light[i].getPosition()[0], light[i].getPosition()[1], light[i].getPosition()[2]], fPosition);

                let shadowHit: HitRecord;
                let isHit: boolean ;
                // Create Shadow Ray and call rayCast
                let offset: vec3 = vec3.create();
                offset = vec3.scale(offset, lightVec_noNorm, 0.01);
                let shadowRay: Ray3D = new Ray3D([fPosition[0]+offset[0], fPosition[1]+offset[1], fPosition[2]+offset[2], 1], [lightVec_noNorm[0], lightVec_noNorm[1], lightVec_noNorm[2], 0]);
                [isHit, shadowHit] = this.rayCast(shadowRay, this.modelview);
                
                // If the shadow ray hits any object
                if(isHit == true)
                {
                    console.log("shadow hit: " + shadowHit.rayT);
                    if(shadowHit.rayT > 0 && shadowHit.rayT < 1)
                    {
                        // This point is in shadow
                        result = vec4.add(result, result, [0, 0, 0, 1]);
                        continue;  
                    }
                }
        
                let tNormal: vec3 = fNormal;
                normalView = vec3.normalize(normalView, [tNormal[0],tNormal[1],tNormal[2]]);
                nDotL = vec3.dot(normalView,lightVec);

        
                viewVec = [-fPosition[0],-fPosition[1],-fPosition[2],];
                viewVec = vec3.normalize(viewVec,viewVec);
        
                // Should be calculated like this
                // I - 2.0 * dot(N, I) * N 
                reflectVec = this.reflect([-lightVec[0], -lightVec[1], -lightVec[2]] ,normalView);
                reflectVec = vec3.normalize(reflectVec, reflectVec);
        
                rDotV = Math.max(vec3.dot(reflectVec,viewVec),0.0);
        
                let spotDirection: vec3 = vec3.normalize(vec3.create(), [light[i].getSpotDirection()[0], light[i].getSpotDirection()[1],light[i].getSpotDirection()[2]]);
                
                //console.log("Spots: " + vec3.dot(spotDirection,vec3.negate(lightVec,lightVec)) + " , " + Math.cos(light[i].getSpotCutoff()));

                //if (vec3.dot(spotDirection,vec3.negate(lightVec,lightVec))>Math.cos(glMatrix.toRadian(light[i].getSpotCutoff()))) {
                    
                    ambient = vec3.multiply(ambient, rayHit.material.getAmbient(),light[i].getAmbient() );
                    diffuse = vec3.multiply(diffuse, rayHit.material.getDiffuse(), vec3.mul(vec3.create(), light[i].getDiffuse(),[Math.max(nDotL,0.0),Math.max(nDotL,0.0),Math.max(nDotL,0.0)]));
                    if (nDotL>0.0)
                        specular = vec3.multiply(specular, rayHit.material.getSpecular(), vec3.multiply(vec3.create(), light[i].getSpecular() , [Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess())]));
                    else
                        specular = [0,0,0];


                    let final: vec3 = [0,0,0];
                    final = vec3.add(final, final, specular);
                    final = vec3.add(final, final, diffuse);
                    final = vec3.add(final, final, ambient);
                    result = vec4.add(result, result,   [final[0], final[1], final[2],1]);  
                //}  
            }
           
        
            return result;
        
        }

    
    public shadeColor(ray: Ray3D, rayHit: HitRecord, modelview: Stack<mat4>, light: Light[] ): vec4 {

        
        // Pass in these values
        let fNormal:vec3 = [rayHit.normalHit[0],rayHit.normalHit[1],rayHit.normalHit[2]];
        let fPosition_temp:vec4 = vec4.add(vec4.create(), ray.position, vec4.scale(vec4.create(), ray.direction, rayHit.rayT));//[rayHit.intersection[0],rayHit.intersection[1],rayHit.intersection[2]];
        let fTexCoord:vec3;
        let fPosition: vec3 = [fPosition_temp[0], fPosition_temp[1], fPosition_temp[2]];
        
        //console.log("normals: " + fNormal);
        
        let lightVec:vec3 = vec3.create();
        let viewVec:vec3= vec3.create();
        let reflectVec:vec3= vec3.create();
        let normalView:vec3= vec3.create();
        let ambient:vec3= vec3.create(),diffuse:vec3= vec3.create(),specular:vec3= vec3.create();
        let nDotL: number,rDotV: number;
        
        
        let result: vec4 = [0,0,0,1];
        let numLights: number = light.length;
        

        for (let i=0;i<numLights;i++)
        {
                if (light[i].getPosition()[3]!=0.0)
                    lightVec = vec3.normalize(lightVec, vec3.subtract(vec3.create(),[light[i].getPosition()[0], light[i].getPosition()[1], light[i].getPosition()[2]], fPosition));
                else
                    lightVec = vec3.normalize(lightVec,[-light[i].getPosition()[0], -light[i].getPosition()[1], -light[i].getPosition()[2]]);
        
                let tNormal: vec3 = fNormal;
                normalView = vec3.normalize(normalView, [tNormal[0],tNormal[1],tNormal[2]]);
                nDotL = vec3.dot(normalView,lightVec);

        
                viewVec = [-fPosition[0],-fPosition[1],-fPosition[2],];
                viewVec = vec3.normalize(viewVec,viewVec);
        
                // Should be calculated like this
                // I - 2.0 * dot(N, I) * N 
                reflectVec = this.reflect([-lightVec[0], -lightVec[1], -lightVec[2]] ,normalView);
                reflectVec = vec3.normalize(reflectVec, reflectVec);
        
                rDotV = Math.max(vec3.dot(reflectVec,viewVec),0.0);
        
                let spotDirection: vec3 = vec3.normalize(vec3.create(), [light[i].getSpotDirection()[0], light[i].getSpotDirection()[1],light[i].getSpotDirection()[2]]);
                
                //console.log("Spots: " + vec3.dot(spotDirection,vec3.negate(lightVec,lightVec)) + " , " + Math.cos(light[i].getSpotCutoff()));

                //if (vec3.dot(spotDirection,vec3.negate(lightVec,lightVec))>Math.cos(glMatrix.toRadian(light[i].getSpotCutoff()))) {
                    
                    ambient = vec3.multiply(ambient, rayHit.material.getAmbient(),light[i].getAmbient() );
                    diffuse = vec3.multiply(diffuse, rayHit.material.getDiffuse(), vec3.mul(vec3.create(), light[i].getDiffuse(),[Math.max(nDotL,0.0),Math.max(nDotL,0.0),Math.max(nDotL,0.0)]));
                    if (nDotL>0.0)
                        specular = vec3.multiply(specular, rayHit.material.getSpecular(), vec3.multiply(vec3.create(), light[i].getSpecular() , [Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess()),Math.pow(rDotV,rayHit.material.getShininess())]));
                    else
                        specular = [0,0,0];


                    let final: vec3 = [0,0,0];
                    final = vec3.add(final, final, specular);
                    final = vec3.add(final, final, diffuse);
                    final = vec3.add(final, final, ambient);
                    result = vec4.add(result, result,   [final[0], final[1], final[2],1]);  
                //}  
            }
           
        
            return result;
        
        }



}


/*let shadowHit: HitRecord;
                let isHit: boolean ;
                // Create Shadow Ray and call rayCast
                let shadowRay: Ray3D = new Ray3D([fPosition[0], fPosition[1], fPosition[2], 1], [lightVec[0], lightVec[1], lightVec[2], 0]);
                [isHit, shadowHit] = this.rayCast(shadowRay, this.modelview);
                
                // If the shadow ray hits any object
                if(isHit == true)
                {
                    if(shadowHit.rayT > 0 && shadowHit.rayT < 1)
                    {
                        // This point is in shadow
                        result = vec4.add(result, result, [0, 0, 0, 1]);
                        //continue;  
                    }
                }*/