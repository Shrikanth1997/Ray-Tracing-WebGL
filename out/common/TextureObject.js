define(["require", "exports", "gl-matrix"], function (require, exports, gl_matrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextureObject = void 0;
    /**
     * This class represents a texture object. It contains not only the texture ID for WebGL, but also the raw pixel data that can be used to manually look up a color.
     */
    class TextureObject {
        constructor(gl, name, textureURL) {
            this.name = name;
            this.id = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.id);
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
                gl.bindTexture(gl.TEXTURE_2D, this.id);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
                gl.generateMipmap(gl.TEXTURE_2D);
                //capture raw data
                let canvas = document.createElement("canvas");
                let context = canvas.getContext("2d");
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                this.data = context.getImageData(0, 0, image.width, image.height).data;
                this.width = canvas.width;
                this.height = canvas.height;
            });
        }
        getTextureID() {
            return this.id;
        }
        getName() {
            return this.name;
        }
        /**
         * Get the color at the given location. The location is assumed to be a texture coordinate. When the location exceeds [0,1], we repeat the texture
         * @param x the x coordinate of the location
         * @param y the y coordinate of the location
         */
        getColor(x, y) {
            let x1, y1, x2, y2;
            x = x - Math.trunc(x); //REPEAT
            y = y - Math.trunc(y); //REPEAT
            x1 = Math.trunc(x * this.width);
            y1 = Math.trunc(y * this.height);
            x1 = (x1 + this.width) % this.width;
            y1 = (y1 + this.height) % this.height;
            x2 = x1 + 1;
            y2 = y1 + 1;
            if (x2 >= this.width)
                x2 = this.width - 1;
            if (y2 >= this.height)
                y2 = this.height - 1;
            let one = this.lookup(x1, y1);
            let two = this.lookup(x2, y1);
            let three = this.lookup(x1, y2);
            let four = this.lookup(x2, y2);
            let inter1, inter2, inter3;
            inter1 = gl_matrix_1.vec4.lerp(gl_matrix_1.vec4.create(), one, three, y - Math.trunc(y));
            inter2 = gl_matrix_1.vec4.lerp(gl_matrix_1.vec4.create(), two, four, y - Math.trunc(y));
            inter3 = gl_matrix_1.vec4.lerp(gl_matrix_1.vec4.create(), inter1, inter2, x - Math.trunc(x));
            return inter3;
        }
        lookup(x, y) {
            return gl_matrix_1.vec4.fromValues(this.data[4 * (y * this.width + x)], this.data[4 * (y * this.width + x) + 1], this.data[4 * (y * this.width + x) + 2], this.data[4 * (y * this.width + x) + 3]);
        }
    }
    exports.TextureObject = TextureObject;
});
//# sourceMappingURL=TextureObject.js.map