/**
 * Utilities useful to set up WebGL context. This code has been heavily borrowed from the code that accompanies "WebGL Programming Guide: Interactive 3D Graphics Programming with WebGL" by Matsuda and Lea
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createErrorHTML = exports.create3DContext = exports.createShader = exports.createShaderProgram = exports.setupWebGL = exports.loadTexture = void 0;
    /**
     * This function imports in an image using HTML's Image class, so that it can be loaded and used as an WebGL texture
     * @param gl the rendering context used to create the texture
     * @param textureURL the URL of the image
     * @return the texture ID of the resulting texture that can be used for texture mapping
     */
    function loadTexture(gl, textureURL) {
        let textureId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureId);
        // Because images have to be download over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
        const image = new Image();
        image.src = textureURL;
        image.addEventListener("load", () => {
            gl.bindTexture(gl.TEXTURE_2D, textureId);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });
        return textureId;
    }
    exports.loadTexture = loadTexture;
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    /**
     * Creates a webgl context. If creation fails it will
     * change the contents of the container of the <canvas>
     * tag to an error message with the correct links for WebGL.
     * @param {Element} canvas. The canvas element to create a
     *     context from.
     * @return {WebGLRenderingContext} The created context.
     */
    function setupWebGL(canvas, attribs) {
        var context = create3DContext(canvas, attribs);
        if (!context || (!(context instanceof WebGLRenderingContext))) {
            var container = document.getElementsByTagName("body")[0];
            container.innerHTML = createErrorHTML(GET_A_WEBGL_BROWSER);
        }
        return context;
    }
    exports.setupWebGL = setupWebGL;
    /**
       * A helper function to create the shader program, given the shader sources.
       * @param gl the WebGLRenderingContext that can be used to call WebGL functions
       * @param vShaderSource the source of the vertex shader, as a string
       * @param fShaderSource the source of the fragment shader, as a string
       * @return the shader program object, as a WebGLProgram object
       */
    function createShaderProgram(gl, vShaderSource, fShaderSource) {
        //create a new shader program
        let program = gl.createProgram();
        //create a shader object for the vertex shader
        let vShader = createShader(gl, vShaderSource, gl.VERTEX_SHADER);
        //create a shader object for the fragment shader
        let fShader = createShader(gl, fShaderSource, gl.FRAGMENT_SHADER);
        //attach the vertex shader to the program
        gl.attachShader(program, vShader);
        //attach the fragment shader to the program
        gl.attachShader(program, fShader);
        //now "link" the program. This links together the two shaders into one program
        gl.linkProgram(program);
        //verify that the shader program was successfully linked
        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            //something went wrong when linking the program; get the error 
            throw "Could not link shader: " + gl.getProgramInfoLog(program);
        }
        return program;
    }
    exports.createShaderProgram = createShaderProgram;
    /**
     * A helper function to create a new shader program, given its source.
     * @param gl the WebGLRenderingContext that can be used to call WebGL functions
     * @param source the source of the shader, as a string
     * @param shaderType the type of the shader (ehter VERTEX_SHADER or FRAGMENT_SHADER)
     * @return the shader object, as a WebGLShader
     */
    function createShader(gl, source, shaderType) {
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        // Check if it compiled
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            throw "could not compile my shader:" + source + ":" + gl.getShaderInfoLog(shader);
        }
        return shader;
    }
    exports.createShader = createShader;
    /**
     * Creates a webgl context.
     * @param {!Canvas} canvas The canvas tag to get context
     *     from. If one is not passed in one will be created.
     * @return {WebGLRenderingContext} The created context.
     */
    function create3DContext(canvas, attribs) {
        var names = ["webgl", "experimental-webgl"];
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                return canvas.getContext("webgl", attribs);
            }
            catch (e) { }
        }
        return null;
    }
    exports.create3DContext = create3DContext;
    /**
     * Creates the HTML for a failure message
     * @param {string} canvasContainerId id of container of th
     *        canvas.
     * @return {string} The html.
     */
    function createErrorHTML(msg) {
        return '' +
            '<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">' + msg + '</div>';
    }
    exports.createErrorHTML = createErrorHTML;
    /**
     * Message for getting a webgl browser
     * @type {string}
     */
    let GET_A_WEBGL_BROWSER = '' +
        'This page requires a browser that supports WebGL.<br/>' +
        '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';
    /**
     * Mesasge for need better hardware
     * @type {string}
     */
    let OTHER_PROBLEM = '' +
        "It doesn't appear your computer can support WebGL.<br/>" +
        '<a href="http://get.webgl.org">Click here for more information.</a>';
});
//# sourceMappingURL=WebGLUtils.js.map