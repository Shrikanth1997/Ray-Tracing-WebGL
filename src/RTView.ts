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

    public scenegraph: Scenegraph<VertexPNT>;

    constructor() {
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

        this.scenegraph = null;
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
                imageData.data[4 * (i * width + j) + 1] = 0;//Math.random() * 255;
                imageData.data[4 * (i * width + j) + 2] = 255;//Math.random() * 255;
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

        let focalLen: number = 1;
        let origin: vec4 = vec4.fromValues(0, 0, 0, 1);
        // Loop over all the pixels
        for(let j: number = this.height-1; j >= 0; j++)
        {
            for(let i: number = 0; i < this.width; i++)
            {
               
                let x: number = (i / (this.width - 1)) * this.width;
                let y: number = (j / (this.height - 1)) * this.height;
                let dir: vec4 = vec4.fromValues((x - this.width/2), (y - this.height/2), -focalLen, 0);
                
                let ray: Ray3D = new Ray3D(origin, dir);
                let color: vec3 = this.rayCast(ray, this.modelview);
            }
        }
    }

    public rayCast(ray: Ray3D, modelView: Stack<mat4>): vec3
    {
        let ifHit: boolean;
        let rayHit: HitRecord;

        if(this.scenegraph == null)
        {
            console.log("RTView scenegraph is null");
        }
        else
        {
            console.log("RTView scenegraph is not null");
        }

        //if(this.scenegraph != null)
        {
            //console.log("RTView scenegraph is not null");
            //if(this.scenegraph.intersect(ray, modelView))
            {
                //console.log("hit");
            }
        }

        return [0,0,0];
    }
}