import { Stack } from "%COMMON/Stack"
import { vec4, mat4, vec3, glMatrix } from "gl-matrix";
import { Ray3D, HitRecord } from "./RayTracing";
import { Scenegraph } from "./Scenegraph";
import { VertexPNT, VertexPNTProducer } from "./VertexPNT";

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
            /*for(let j: number = H-1; j >= 0; j--, index_r++)
            {
                for(let i: number = 0; i < W; i++, index_c++)
                {
                    let x: number = (i / (W - 1)) * W;
                    let y: number = (j / (H - 1)) * H;
                    let dir: vec4 = vec4.fromValues((x - W/2), (y - H/2), -focalLen, 0);
                    
                    let ray: Ray3D = new Ray3D(origin, dir);
                    let color: vec3 = this.rayCast(ray, this.modelview);

                    this.imageData.data[4 * (index_r * W + index_c)] = color[0];//Math.random() * 255;
                    this.imageData.data[4 * (index_r * W + index_c) + 1] = color[1];//Math.random() * 255;
                    this.imageData.data[4 * (index_r * W + index_c) + 2] = color[2];//Math.random() * 255;
                    this.imageData.data[4 * (index_r * W + index_c) + 3] = 255;

                    //console.log("COLOR: " + color[0]+color[1]+color[2]);
                }
            }*/
            for(let y: number =0;y<=H;y=y+1){
                for(let x: number=0;x<=W;x=x+1){
                    let Sv: vec4 = [0,0,0,1];
                    //let V: vec4 = [x-W/2, y-H/2, (-H/2)/Math.tan(glMatrix.toRadian(30)),1];
                    let V: vec4 = [0,0,-1,0];
                    let ray: Ray3D = new Ray3D(Sv, V);

                    let color: vec3 = this.rayCast(ray, this.modelview);

                    this.imageData.data[4 * (y * W + x)] = color[0];//Math.random() * 255;
                    this.imageData.data[4 * (y * W + x) + 1] = color[1];//Math.random() * 255;
                    this.imageData.data[4 * (y * W + x) + 2] = color[2];//Math.random() * 255;
                    this.imageData.data[4 * (y * W + x) + 3] = 255;

                    //console.log("COLOR: " + color);
                }
            }

            console.log(" =================== Tracing DONE ===============");
            this.canvas.getContext('2d').putImageData(this.imageData, 0, 0);
            //this.fillCanvas();
        }
        
    }

    public rayCast(ray: Ray3D, modelView: Stack<mat4>): vec3
    {
        let ifHit: boolean;
        let rayHit: HitRecord;

        
        //console.log("Reached cast " + this.scenegraph);

        if(this.scenegraph != null)
        {
            //console.log("RTView scenegraph is not null " + this.scenegraph.intersect(ray, modelView));
            if(this.scenegraph.intersect(ray, modelView)==true)
            {
                //console.log("hit");
                return [200,200,100];
            }
            else{
                //console.log("NO hit");
                return [0,0,0];
            }
        }

        return [0,0,0];
    }
}