import { View } from "./View"
import * as WebGLUtils from "%COMMON/WebGLUtils"
import { RTView } from "./RTView";

/**
 * This is the main function of our web application. This function is called at the end of this file. In the HTML file, this script is loaded in the head so that this function is run.
 */
function main(): void {
    console.log("Here I am");
    //retrieve <canvas> element
    var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#glCanvas");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    //get the rendering context for webgl
    let gl: WebGLRenderingContext = WebGLUtils.setupWebGL(canvas, { 'antialias': false, 'alpha': false, 'depth': false, 'stencil': false });

    // Only continue if WebGL is available and working
    if (gl == null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }



    //create the View. The View will encapsulate all our meaningful webgl code
    let view: View = new View(gl);

    let vShaderSource: string;
    let fShaderSource: string;

    //get the vertex and fragment shader code as a string
    vShaderSource = getVShader();
    fShaderSource = getFShader();


    //initialize the view, and pass the shader sources to the view
    //this.view.init(vShaderSource, fShaderSource);

    //draw the view. You must call draw *each time* you would like to draw the screen (i.e. there is no auto refresh)
    view.draw();

    //set up the ray tracer view
    let raytracerView: RTView = new RTView();
    raytracerView.fillCanvas();

}

function init(gl: WebGLRenderingContext) {

}

function draw(gl: WebGLRenderingContext) {

}

function getVShader(): string {
    return `attribute vec4 vPosition;
    uniform vec4 vColor;
    uniform mat4 proj;
    varying vec4 outColor;
    
    void main()
    {
        gl_Position = proj * vPosition;
        outColor = vColor;
    }
    `;
}

function getFShader(): string {
    return `precision mediump float;
    varying vec4 outColor;

    void main()
    {
        gl_FragColor = outColor;
    }
    `;
}

main();