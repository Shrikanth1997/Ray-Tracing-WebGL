define(["require", "exports", "%COMMON/Stack", "gl-matrix", "./RayTracing"], function (require, exports, Stack_1, gl_matrix_1, RayTracing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RTView = void 0;
    class RTView {
        constructor(check) {
            this.canvas = document.querySelector("#raytraceCanvas");
            if (!this.canvas) {
                console.log("Failed to retrieve the <canvas> element");
                return;
            }
            //button clicks
            let button = document.querySelector("#savebutton");
            button.addEventListener("click", ev => this.saveCanvas());
            this.modelview = new Stack_1.Stack();
            this.width = Number(this.canvas.getAttribute("width"));
            this.height = Number(this.canvas.getAttribute("height"));
            this.check = check;
            this.scenegraph = null;
        }
        saveCanvas() {
            let link = document.createElement('a');
            link.href = this.canvas.toDataURL('image/png');
            link.download = "result.png";
            link.click();
        }
        fillCanvas() {
            let width = Number(this.canvas.getAttribute("width"));
            let height = Number(this.canvas.getAttribute("height"));
            let imageData = this.canvas.getContext('2d').createImageData(width, height);
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    imageData.data[4 * (i * width + j)] = 0; //Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 1] = 0; //Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 2] = 255; //Math.random() * 255;
                    imageData.data[4 * (i * width + j) + 3] = 255;
                }
            }
            this.canvas.getContext('2d').putImageData(imageData, 0, 0);
            let context = this.canvas.getContext('2d');
            context.fillStyle = 'red';
            //context.fillRect(100, 100, 400, 400);
        }
        rayTrace() {
            // modelView matrix
            while (!this.modelview.isEmpty())
                this.modelview.pop();
            this.modelview.push(gl_matrix_1.mat4.create());
            this.modelview.push(gl_matrix_1.mat4.clone(this.modelview.peek()));
            let eye = gl_matrix_1.vec3.fromValues(0, 0, -50);
            gl_matrix_1.mat4.lookAt(this.modelview.peek(), eye, gl_matrix_1.vec3.fromValues(0, 0, 0), gl_matrix_1.vec3.fromValues(0, 1, 0));
            let H = this.height;
            let W = this.width;
            let focalLen = 1;
            let origin = gl_matrix_1.vec4.fromValues(0, 0, 0, 1);
            // Loop over all the pixels
            /*for(let j: number = this.height-1; j >= 0; j++)
            {
                for(let i: number = 0; i < this.width; i++)
                {
                   
                    let x: number = (i / (this.width - 1)) * this.width;
                    let y: number = (j / (this.height - 1)) * this.height;
                    let dir: vec4 = vec4.fromValues((x - this.width/2), (y - this.height/2), -focalLen, 0);
                    
                    let ray: Ray3D = new Ray3D(origin, dir);
                    let color: vec3 = this.rayCast(ray, this.modelview);
                }
            }*/
            if (this.scenegraph != null) {
                for (let x = 0; x <= W / 2; x = x + 1) {
                    for (let y = 0; y <= H / 2; y = y + 1) {
                        let Sv = [0, 0, 0, 1];
                        let V = [x - W / 2, y - H / 2, (-H / 2) / Math.tan(gl_matrix_1.glMatrix.toRadian(30)), 1];
                        let ray = new RayTracing_1.Ray3D(Sv, V);
                        let color = this.rayCast(ray, this.modelview);
                        console.log("COLOR: " + color);
                    }
                }
            }
        }
        rayCast(ray, modelView) {
            let ifHit;
            let rayHit;
            console.log("Reached cast " + this.scenegraph);
            /*if(this.scenegraph == null)
            {
                console.log("RTView scenegraph is null");
            }
            else
            {
                console.log("RTView scenegraph is not null");
            }*/
            if (this.scenegraph != null) {
                console.log("RTView scenegraph is not null " + this.scenegraph.intersect(ray, modelView));
                if (this.scenegraph.intersect(ray, modelView) == true) {
                    console.log("hit");
                    return [1, 1, 1];
                }
                else {
                    console.log("NO hit");
                }
            }
            return [0, 0, 0];
        }
    }
    exports.RTView = RTView;
});
//# sourceMappingURL=RTView.js.map